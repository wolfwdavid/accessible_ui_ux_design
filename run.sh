#!/usr/bin/env bash
# AccessibleMake — Linux/macOS launcher
# Double-click this file or run: bash run.sh

cd "$(dirname "$0")"

# Find Python 3
if command -v python3 &>/dev/null; then
    PYTHON=python3
elif command -v python &>/dev/null; then
    PYTHON=python
else
    echo "Error: Python 3 is required but not found."
    echo "Install it from https://www.python.org/downloads/"
    echo "  macOS:  brew install python3"
    echo "  Ubuntu: sudo apt install python3"
    read -rp "Press Enter to exit..."
    exit 1
fi

echo "Starting AccessibleMake..."
$PYTHON run.py
