#!/usr/bin/env bash
# AccessibleMake — macOS launcher
# Double-click this file in Finder to launch the app

cd "$(dirname "$0")"

if command -v python3 &>/dev/null; then
    python3 run.py
elif command -v python &>/dev/null; then
    python run.py
else
    echo "Error: Python 3 is required but not found."
    echo "Install it with: brew install python3"
    echo "Or download from https://www.python.org/downloads/"
    read -rp "Press Enter to exit..."
    exit 1
fi
