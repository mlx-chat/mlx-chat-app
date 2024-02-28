from typing import Any, Literal, Optional


class Document():
    """Class for storing a piece of text and associated metadata."""

    page_content: str
    """String text."""
    metadata: dict = dict()
    """Arbitrary metadata about the page content (e.g., source, relationships to other
        documents, etc.).
    """
    type: Literal["Document"] = "Document"

    def __init__(self, page_content: str, metadata: Optional[dict] = None, **kwargs: Any) -> None:
        """Pass page_content in as positional or named arg."""
        self.page_content = page_content
        self.metadata = metadata or dict()

        for key, value in kwargs.items():
            setattr(self, key, value)
