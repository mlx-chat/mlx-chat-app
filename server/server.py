import os
import re
import json
import time
import uuid
import glob
import argparse
import random

import mlx.core as mx
import mlx.nn as nn

from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Optional
from transformers import PreTrainedTokenizer
from concurrent.futures import ThreadPoolExecutor

from .utils import load, generate_step

_model: Optional[nn.Module] = None
_tokenizer: Optional[PreTrainedTokenizer] = None


def load_model(model_path: str, adapter_file: Optional[str] = None):
    global _model
    global _tokenizer
    _model, _tokenizer = load(model_path, adapter_file=adapter_file)


def create_response(chat_id, prompt, tokens, text):
    response = {
        'id': chat_id,
        'object': 'chat.completion',
        'created': int(time.time()),
        'model':  _model.model_type,
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


def manage_directory(directory: Optional[str] = None) -> Optional[str]:
    # TODO: proper error handling if (directory does not exist/empty) or (reading fails)
    # TODO: cache directory content
    # TODO: handle supported file types safely
    if directory is not None and os.path.exists(directory):
        allowed_extensions = ['.txt', '.md', '.csv', '.json', '.xml']

        def read_file(file_path):
            _, file_extension = os.path.splitext(file_path)
            if file_extension.lower() in allowed_extensions:
                with open(file_path, 'r', encoding='utf-8') as file:
                    return file.read()

        files = glob.glob(os.path.join(directory, '**', '*.*'), recursive=True)

        random.seed(42)
        random.shuffle(files)

        with ThreadPoolExecutor() as executor:
            data = list(filter(None, executor.map(read_file, files)))

        return '\n'.join(data)


def format_messages(body, condition):
    failedString = "ERROR"
    body['messages'][-1]['content'] = f"""
Only using the documents in the index, answer the following, Respond with just the answer, no "The answer is" or "Answer: " or anything like that.

Question:

{body['messages'][-1]['content']}

Index:

{condition}

Remember, if you do not know the answer, just say "{failedString}",
Try to give as much detail as possible, but only from what is provided within the index.
If steps are given, you MUST ALWAYS use bullet points to list each of them them and you MUST use markdown when applicable.
You MUST markdown when applicable.
Only use information you can find in the index, do not make up knowledge.
Remember, use bullet points or numbered steps to better organize your answer if applicable.
NEVER try to make up the answer, always return "{failedString}" if you do not know the answer or it's not provided in the index.
Never say "is not provided in the index", use "{failedString}" instead.
    """.strip()


class APIHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def do_POST(self):
        if self.path == '/v1/chat/completions':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            self._set_headers(200)

            response = self.handle_post_request(post_data)

            self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(b'Not Found')

    def handle_post_request(self, post_data):
        body = json.loads(post_data.decode('utf-8'))
        chat_id = f'chatcmpl-{uuid.uuid4()}'

        directory = body.get('directory', None)
        condition = manage_directory(directory)
        condition = re.split(r'\s+|\n+', condition)
        condition = ' '.join(condition[:2**8])
        if condition:
            format_messages(body, condition)

        print(body, flush=True)

        prompt = mx.array(_tokenizer.encode(_tokenizer.apply_chat_template(
            body['messages'],
            tokenize=False,
            add_generation_prompt=True,
        ), add_special_tokens=True))

        max_tokens = body.get('max_tokens', 100)
        repetition_penalty = body.get('repetition_penalty', None)
        repetition_context_size = body.get('repetition_context_size', 20)
        temperature = body.get('temperature', 0.0)
        top_p = body.get('top_p', 1.0)

        tokens = []
        REPLACEMENT_CHAR = '\ufffd'
        for (token, prob), _ in zip(
            generate_step(
                prompt,
                _model,
                temperature,
                repetition_penalty,
                repetition_context_size,
                top_p,
            ),
            range(max_tokens),
        ):
            if token == _tokenizer.eos_token_id:
                break
            tokens.append(token.item())

        text = _tokenizer.decode(tokens).replace(REPLACEMENT_CHAR, '')
        return create_response(chat_id, prompt, tokens, text)


def run(host: str, port: int, server_class=HTTPServer, handler_class=APIHandler):
    server_address = (host, port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting httpd at {host} on port {port}...')
    httpd.serve_forever()


if __name__ == '__main__':
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

    run(args.host, args.port)
