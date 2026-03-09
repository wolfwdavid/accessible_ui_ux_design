#!/usr/bin/env python3
"""
AccessibleMake - Desktop Launcher
Runs the application as a native desktop window.
Falls back to opening in the default browser if pywebview is not installed.

Supported platforms: Windows, macOS, Linux
"""
import os
import sys
import platform
import threading
import http.server
import socketserver
import webbrowser

PORT = 8000
DIR = os.path.dirname(os.path.abspath(__file__))

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP handler that serves files from the project directory."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def log_message(self, format, *args):
        pass  # Suppress console output

def find_free_port(start=8000, end=9000):
    """Find an available port."""
    import socket
    for port in range(start, end):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('127.0.0.1', port))
                return port
        except OSError:
            continue
    return start

def start_server(port):
    """Start the HTTP server in a background thread."""
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", port), QuietHandler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd

def get_webview_gui():
    """Return the best pywebview GUI backend for the current platform."""
    system = platform.system()
    if system == "Darwin":
        return None  # pywebview uses Cocoa/WebKit by default on macOS
    elif system == "Linux":
        # Prefer GTK on Linux; falls back automatically if unavailable
        return "gtk"
    else:
        return None  # pywebview uses EdgeChromium/MSHTML on Windows

def run_with_webview(port):
    """Launch in a native desktop window using pywebview."""
    import webview
    url = f"http://127.0.0.1:{port}"
    window = webview.create_window(
        "AccessibleMake — Accessible Design Tool",
        url,
        width=1400,
        height=900,
        min_size=(1024, 600),
        resizable=True,
        text_select=True,
    )
    gui = get_webview_gui()
    webview.start(gui=gui, debug=False)

def run_with_browser(port):
    """Launch in the default web browser."""
    url = f"http://127.0.0.1:{port}"
    print(f"\n  AccessibleMake is running at: {url}")
    quit_key = "Ctrl+C" if platform.system() != "Darwin" else "⌘+C or Ctrl+C"
    print(f"  Press {quit_key} to stop.\n")
    webbrowser.open(url)
    try:
        while True:
            threading.Event().wait(1)
    except KeyboardInterrupt:
        print("\n  Shutting down...")

def main():
    port = find_free_port()
    httpd = start_server(port)
    print(f"  [AccessibleMake] Server started on port {port}")

    try:
        run_with_webview(port)
    except ImportError:
        print("  [AccessibleMake] pywebview not found, opening in browser.")
        print("  Tip: Install pywebview for a native desktop window:")
        system = platform.system()
        if system == "Linux":
            print("       pip install pywebview[gtk]")
            print("       (also needs: sudo apt install python3-gi python3-gi-cairo gir1.2-webkit2-4.1)")
        elif system == "Darwin":
            print("       pip install pywebview")
        else:
            print("       pip install pywebview")
        run_with_browser(port)
    except Exception as e:
        print(f"  [AccessibleMake] Webview error: {e}, falling back to browser.")
        run_with_browser(port)
    finally:
        httpd.shutdown()

if __name__ == "__main__":
    main()
