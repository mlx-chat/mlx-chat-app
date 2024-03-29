
![](docs/design-logo-light.png#gh-light-mode-only)
![](docs/design-logo-dark.png#gh-dark-mode-only)


**Chat with MLX** is a high-performance macOS application that connects your local documents to a personalized large language model (LLM). By leveraging retrieval-augmented generation (RAG), open source LLMs, and MLX for accelerated machine learning on Apple silicon, you can efficently search, query, and interact with your documents *without information ever leaving your device.*

Our high-level features include:
- **Query**: load and search with document-specific prompts
- **Converse**: switch model interaction modes (converse vs. assist) in real time
- **Instruct**: provide personalization and response tuning

## Installation and Setup

:warning: **Preliminary Steps**: we are working to release with correct packaging ([pyinstaller](https://github.com/pyinstaller/pyinstaller/) & [electron-builder](https://github.com/electron-userland/electron-builder)) and authentication ([Apple codesign](https://developer.apple.com/support/code-signing/)). In the interium, please clone and run in development by first setting up authentication and requirements. 

First, setup huggingface [access tokens](https://huggingface.co/settings/tokens) to download models (request access to [google/gemma-7b-it](https://huggingface.co/google/gemma-7b-it)), then
```bash
huggingface-cli login
```
Then download the npm/python requirements
```bash
cd app && npm install
pip install -r server/requirements.txt
```
Finally, start the application
```bash
cd app && npm run dev
```

## Contributions
All contributions are welcome. Please take a look at [contributing](CONTRIBUTING.md) guide.
