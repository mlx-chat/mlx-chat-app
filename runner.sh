#!/bin/bash

collect_modules=(
  "mlx"
  "chromadb"
)

hidden_imports=(
  "server.models"
  "server.models.gemma"
  "server.models.bert"
  "server.models.llama"
)

exclude_modules=(
  "torch"
  "torchaudio"
  "torchvision"
  "tensorflow"
  "matplotlib"
  "pandas"
  "PIL"
  "IPython"
)

misc_params=(
  "--copy-metadata opentelemetry-sdk"
)

command="pyinstaller --onefile runner.py"

for module in "${collect_modules[@]}"; do
  command+=" --collect-all $module"
done
for module in "${hidden_imports[@]}"; do
  command+=" --hidden-import $module"
done
for module in "${exclude_modules[@]}"; do
  command+=" --exclude-module $module"
done
for param in "${misc_params[@]}"; do
  command+=" $param"
done

eval "$command"
