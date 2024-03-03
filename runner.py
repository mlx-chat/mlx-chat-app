# Parent script to package (PyInstaller) server
#
# Example Usage:
#
# pyinstaller --onefile --collect-all mlx --copy-metadata opentelemetry-sdk \
# --hidden-import server.models --hidden-import server.models.gemma --hidden-import server.models.bert \
# runner.py

from server import server
server.main()
