import json
import time
import uuid
import argparse

import mlx.core as mx
import mlx.nn as nn

from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Optional
from transformers import PreTrainedTokenizer

from .utils import load, generate_step

from .retriever.loader import directory_loader
from .retriever.splitter import RecursiveCharacterTextSplitter
from .retriever.vectorstore import Chroma, Embeddings

_model: Optional[nn.Module] = None
_tokenizer: Optional[PreTrainedTokenizer] = None
_database: Optional[Chroma] = None


def load_model(model_path: str, adapter_file: Optional[str] = None):
    global _model
    global _tokenizer
    _model, _tokenizer = load(model_path, adapter_file=adapter_file)


def load_database(directory: str):
    global _database
    # TODO: handle error from directory_loader on invalid
    raw_docs = directory_loader(directory)
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=4000, chunk_overlap=200, add_start_index=True
    )
    splits = text_splitter.split_documents(raw_docs)
    _database = Chroma.from_documents(
        documents=splits, embedding=Embeddings(_model.model, _tokenizer))


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


def format_messages(messages, condition):
    failedString = "ERROR"
    if condition:
        messages[-1]['content'] = f"""
Only using the documents in the index, answer the following, Respond with just the answer, no "The answer is" or "Answer: " or anything like that.

Question:

{messages[-1]['content']}

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
    return messages


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

        load_database(body.get('directory', None))
        # emperically better than similarity_search
        docs = _database.max_marginal_relevance_search(
            body['messages'][-1]['content'])
        context = '\n'.join([doc.page_content for doc in docs])
        print(body, flush=True)
        print(('\n'+'--'*10+'\n').join([
            f'{doc.metadata}\n{doc.page_content}' for doc in docs]), flush=True)

        prompt = mx.array(_tokenizer.encode(_tokenizer.apply_chat_template(
            format_messages(body['messages'], context),
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
