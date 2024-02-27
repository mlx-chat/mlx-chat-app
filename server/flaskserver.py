import argparse
import uuid
import time
import json
import numpy as np
import mlx.core as mx
import mlx.nn as nn

from collections import namedtuple
from typing import List, Optional
from flask import Flask, request, Response
from transformers import PreTrainedTokenizer

from .utils import load

app = Flask(__name__)


_model: Optional[nn.Module] = None
_tokenizer: Optional[PreTrainedTokenizer] = None


def load_model(model_path: str, adapter_file: Optional[str] = None) -> None:
    global _model
    global _tokenizer
    _model, _tokenizer = load(model_path, adapter_file=adapter_file)


StopCondition = namedtuple('StopCondition', ['stop_met', 'trim_length'])


def stopping_criteria(
    tokens: List[int],
    stop_id_sequences: List[np.ndarray],
    eos_token_id: int,
) -> StopCondition:
    '''
    Determines whether the token generation should stop based on predefined conditions.

    Args:
        tokens (List[int]): The current sequence of generated tokens.
        stop_id_sequences (List[np.ndarray]): A list of numpy arrays, each representing a sequence of token IDs.
            If the end of the `tokens` list matches any of these sequences, the generation should stop.
        eos_token_id (int): The token ID that represents the end-of-sequence. If the last token in `tokens` matches this,
            the generation should stop.

    Returns:
        StopCondition: A named tuple indicating whether the stop condition has been met (`stop_met`)
            and how many tokens should be trimmed from the end if it has (`trim_length`).
    '''
    if tokens and tokens[-1] == eos_token_id:
        return StopCondition(stop_met=True, trim_length=0)

    for stop_ids in stop_id_sequences:
        if len(tokens) >= len(stop_ids):
            if np.array_equal(tokens[-len(stop_ids):], stop_ids):
                return StopCondition(stop_met=True, trim_length=len(stop_ids))

    return StopCondition(stop_met=False, trim_length=0)


def generate(prompt: mx.array, model: nn.Module, temp: float = 0.0, top_p: float = 1.0):
    def sample(logits):
        if temp == 0:
            return mx.argmax(logits, axis=-1)
        else:
            if top_p > 0 and top_p < 1.0:
                if (
                    logits.dtype == mx.bfloat16
                ):  # workdaround for unable to load kernel contiguous_scan_inclusive_sum_bfloat16_bfloat16
                    logits = logits.astype(mx.float32)
                probs = mx.softmax(logits / temp, axis=-1)

                sorted_probs = mx.sort(probs)[::-1]
                sorted_indices = mx.argsort(probs)[::-1]
                cumulative_probs = mx.cumsum(sorted_probs, axis=-1)

                top_probs = mx.where(
                    cumulative_probs > 1 - top_p,
                    sorted_probs,
                    mx.zeros_like(sorted_probs),
                )
                sorted_tok = mx.random.categorical(mx.log(top_probs))
                tok = sorted_indices.squeeze(0)[sorted_tok]
                return tok
        return mx.random.categorical(logits * (1 / temp))

    y = prompt
    cache = None

    while True:
        logits, cache = model(y[None], cache=cache)
        logits = logits[:, -1, :]

        y = sample(logits)
        token = y.item()

        yield token


def convert_chat(messages: any, role_mapping: Optional[dict] = None) -> str:
    default_role_mapping = {
        'system_prompt': 'A chat between a curious user and an artificial intelligence assistant. The assistant follows the given rules no matter what.',
        'system': "ASSISTANT's RULE: ",
        'user': 'USER: ',
        'assistant': 'ASSISTANT: ',
        'stop': '\n',
    }
    role_mapping = role_mapping if role_mapping is not None else default_role_mapping

    prompt = ''
    for line in messages:
        role_prefix = role_mapping.get(line['role'], '')
        stop = role_mapping.get('stop', '')
        content = line.get('content', '')
        prompt += f'{role_prefix}{content}{stop}'

    prompt += role_mapping.get('assistant', '')
    return prompt.rstrip()


def create_response(chat_id, requested_model, prompt, tokens, text):
    response = {
        'id': chat_id,
        'object': 'chat.completion',
        'created': int(time.time()),
        'model': requested_model,
        'system_fingerprint': f'fp_{uuid.uuid4()}',
        'choices': [
            {
                'index': 0,
                'message': {
                    'role': 'assistant',
                    'content': text,
                },
                'logprobs': None,
                'finish_reason': None,
            }
        ],
        'usage': {
            'prompt_tokens': len(prompt),
            'completion_tokens': len(tokens),
            'total_tokens': len(prompt) + len(tokens),
        },
    }

    return response


class APIHandler:
    @staticmethod
    def _set_headers(response, status_code=200):
        response.status_code = status_code
        response.headers["Content-type"] = "application/json"
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"

    @staticmethod
    def handle_post_request(post_data):
        body = json.loads(post_data.decode("utf-8"))
        chat_id = f"chatcmpl-{uuid.uuid4()}"
        if hasattr(_tokenizer, "apply_chat_template") and _tokenizer.chat_template:
            prompt = _tokenizer.apply_chat_template(
                body["messages"],
                tokenize=True,
                add_generation_prompt=True,
                return_tensors="np",
            )
        else:
            prompt = convert_chat(body["messages"], body.get("role_mapping"))
            prompt = _tokenizer.encode(prompt, return_tensors="np")

        prompt = mx.array(prompt[0])
        stop_words = body.get("stop", [])
        stop_words = [stop_words] if isinstance(
            stop_words, str) else stop_words
        stop_id_sequences = [
            _tokenizer.encode(stop_word, return_tensors="np",
                              add_special_tokens=False)[0]
            for stop_word in stop_words
        ]
        eos_token_id = _tokenizer.eos_token_id
        max_tokens = body.get("max_tokens", 100)
        stream = body.get("stream", False)
        requested_model = body.get("model", "default_model")
        temperature = body.get("temperature", 1.0)
        top_p = body.get("top_p", 1.0)
        if not stream:
            tokens = []
            for token, _ in zip(
                generate(prompt, _model, temperature, top_p=top_p),
                range(max_tokens),
            ):
                tokens.append(token)
                stop_condition = stopping_criteria(
                    tokens, stop_id_sequences, eos_token_id
                )
                if stop_condition.stop_met:
                    if stop_condition.trim_length:
                        tokens = tokens[: -stop_condition.trim_length]
                    break

            text = _tokenizer.decode(tokens)
            return create_response(chat_id, requested_model, prompt, tokens, text)
        else:
            pass

    @app.route('/v1/chat/completions', methods=['POST', 'OPTIONS'])
    def chat_completions():
        try:
            if request.method == 'OPTIONS':
                response = Response()
                APIHandler._set_headers(response, 204)
                return response

            elif request.method == 'POST':
                post_data = request.data
                response = Response()

                APIHandler._set_headers(response, 200)

                response_data = APIHandler.handle_post_request(post_data)

                response.data = json.dumps(response_data)
                return response
        except Exception as e:
            return Response(json.dumps({"error": f"An unexpected error occurred. {e}"}),
                            status=500, content_type="application/json")


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='MLX Http Server.')
    parser.add_argument(
        '--model',
        type=str,
        required=True,
        help='The path to the MLX model weights, tokenizer, and config',
    )
    parser.add_argument(
        '--adapter-file',
        type=str,
        help='Optional path for the trained adapter weights.',
    )
    parser.add_argument(
        '--host',
        type=str,
        default='127.0.0.1',
        help='Host for the HTTP server (default: 127.0.0.1)',
    )
    parser.add_argument(
        '--port',
        type=int,
        default=8080,
        help='Port for the HTTP server (default: 8080)',
    )
    args = parser.parse_args()

    load_model(args.model, adapter_file=args.adapter_file)

    app.run(host=args.host, port=args.port)
