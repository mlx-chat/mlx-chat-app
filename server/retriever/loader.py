import os
import glob
from typing import List, Optional
from concurrent.futures import ThreadPoolExecutor

from .document import Document


def directory_loader(directory: Optional[str] = None) -> Optional[List[Document]]:
    if directory is not None and os.path.exists(directory):
        allowed_extensions = ['.txt', '.md', '.csv', '.json', '.xml']

        def read_file(file_path):
            _, file_extension = os.path.splitext(file_path)
            if file_extension.lower() in allowed_extensions:
                with open(file_path, 'r', encoding='utf-8') as file:
                    return Document(page_content=file.read(), metadata={'source': file_path})

        files = glob.glob(os.path.join(directory, '**', '*.*'), recursive=True)

        with ThreadPoolExecutor() as executor:
            return list(filter(None, executor.map(read_file, files)))
