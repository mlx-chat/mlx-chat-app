import mlx.core as mx
import mlx.nn as nn

import torch
import torch.nn.functional as F
from torch import Tensor

from transformers import AutoModel, AutoTokenizer, PreTrainedTokenizer
from abc import ABC, abstractmethod
from typing import Any, List


class Embeddings(ABC):
    """Interface for embedding models."""

    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed search docs."""

    @abstractmethod
    def embed_query(self, text: str) -> List[float]:
        """Embed query text."""


class E5Embeddings(Embeddings):

    model: Any = None
    tokenizer: PreTrainedTokenizer = None

    def __init__(self, model_name: str = 'intfloat/multilingual-e5-small'):
        self.model = AutoModel.from_pretrained(model_name)
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)

    def _average_pool(self, last_hidden_states: Tensor, attention_mask: Tensor) -> Tensor:
        last_hidden = last_hidden_states.masked_fill(
            ~attention_mask[..., None].bool(), 0.0)
        return last_hidden.sum(dim=1) / attention_mask.sum(dim=1)[..., None]

    def embed_documents(self, texts: List[str], batch_size: int = 1) -> List[List[float]]:
        embeddings = []
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i+batch_size]
            batch_embeddings = self.embed_query(batch_texts, batch=True)
            embeddings.extend(batch_embeddings)
        return embeddings

    @torch.no_grad()
    def embed_query(self, texts: Any, batch: bool = False) -> List[Any]:
        batch_dict = self.tokenizer(texts, max_length=512, padding=True,
                                    truncation=True, return_tensors='pt', return_attention_mask=True)
        outputs = self.model(**batch_dict)
        embeddings = self._average_pool(
            outputs.last_hidden_state, batch_dict['attention_mask'])
        embeddings = F.normalize(embeddings, p=2, dim=1)

        if batch:
            return embeddings.tolist()  # -> List[List[float]]

        return embeddings[0].tolist()  # -> List[float]


class ChatEmbeddings(Embeddings):

    model: nn.Module = None
    tokenizer: PreTrainedTokenizer = None

    def __init__(self, model: nn.Module, tokenizer: PreTrainedTokenizer):
        self.model = model
        self.tokenizer = tokenizer

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_query(text) for text in texts]

    def embed_query(self,  text: str) -> List[float]:
        h = self.model.embed_tokens(mx.array(
            self.tokenizer.encode(text, add_special_tokens=False)))
        # normalized to have unit length
        h = mx.mean(h, axis=0)
        h = h / mx.linalg.norm(h)
        return h.tolist()
