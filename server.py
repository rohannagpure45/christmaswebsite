#!/usr/bin/env python3
"""
HTTP Server with Range Request Support for iOS Safari Video Streaming.

This server extends Python's SimpleHTTPRequestHandler to properly handle
HTTP byte-range requests, which are required for video playback on iOS Safari.
"""

import os
import re
from http.server import HTTPServer, SimpleHTTPRequestHandler
from functools import partial


class RangeRequestHandler(SimpleHTTPRequestHandler):
    """HTTP request handler with Range header support for video streaming."""

    def send_head(self):
        """Handle HEAD requests and Range headers for partial content."""
        path = self.translate_path(self.path)
        
        # Handle directory requests normally
        if os.path.isdir(path):
            return super().send_head()
        
        # Check if file exists
        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(404, "File not found")
            return None
        
        try:
            fs = os.fstat(f.fileno())
            file_size = fs.st_size
            
            # Get content type
            ctype = self.guess_type(path)
            
            # Check for Range header
            range_header = self.headers.get('Range')
            
            if range_header:
                # Parse Range header (e.g., "bytes=0-1000" or "bytes=0-")
                range_match = re.match(r'bytes=(\d+)-(\d*)', range_header)
                
                if range_match:
                    start = int(range_match.group(1))
                    end_str = range_match.group(2)
                    end = int(end_str) if end_str else file_size - 1
                    
                    # Validate range
                    if start >= file_size:
                        self.send_error(416, "Requested Range Not Satisfiable")
                        f.close()
                        return None
                    
                    # Clamp end to file size
                    end = min(end, file_size - 1)
                    content_length = end - start + 1
                    
                    # Send 206 Partial Content response
                    self.send_response(206)
                    self.send_header("Content-Type", ctype)
                    self.send_header("Content-Length", str(content_length))
                    self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
                    self.send_header("Accept-Ranges", "bytes")
                    self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
                    # Add CORS headers for broader compatibility
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    
                    # Seek to start position and return file handle
                    f.seek(start)
                    # Store end position for copyfile
                    f._range_end = end
                    f._range_start = start
                    return f
            
            # No Range header - send full file with Accept-Ranges header
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(file_size))
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
            # Add CORS headers
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            return f
            
        except Exception:
            f.close()
            raise

    def copyfile(self, source, outputfile):
        """Copy data from source to outputfile, respecting range if set."""
        # Check if this is a range request
        if hasattr(source, '_range_end'):
            # Read only the requested range
            start = source._range_start
            end = source._range_end
            remaining = end - start + 1
            
            # Read in chunks to avoid memory issues with large files
            chunk_size = 64 * 1024  # 64KB chunks
            while remaining > 0:
                chunk = source.read(min(chunk_size, remaining))
                if not chunk:
                    break
                try:
                    outputfile.write(chunk)
                except (BrokenPipeError, ConnectionResetError):
                    # Client closed connection - this is normal for video seeking
                    break
                remaining -= len(chunk)
        else:
            # Full file transfer
            try:
                super().copyfile(source, outputfile)
            except (BrokenPipeError, ConnectionResetError):
                # Client closed connection - ignore silently
                pass

    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS preflight."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Range")
        self.end_headers()


def run_server(port=8080, directory=None):
    """Run the HTTP server with range request support."""
    if directory:
        os.chdir(directory)
    
    handler = RangeRequestHandler
    
    # Suppress broken pipe error messages
    handler.log_error = lambda self, format, *args: None if 'Broken pipe' in str(args) else SimpleHTTPRequestHandler.log_error(self, format, *args)
    
    server_address = ('', port)
    httpd = HTTPServer(server_address, handler)
    
    print(f"🎄 Christmas Website Server")
    print(f"📡 Serving at http://localhost:{port}")
    print(f"📁 Directory: {os.getcwd()}")
    print(f"🎬 Video streaming with Range request support enabled")
    print(f"\nPress Ctrl+C to stop the server\n")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
        httpd.shutdown()


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='HTTP server with Range request support for video streaming')
    parser.add_argument('-p', '--port', type=int, default=8080, help='Port to serve on (default: 8080)')
    parser.add_argument('-d', '--directory', type=str, default=None, help='Directory to serve (default: current directory)')
    
    args = parser.parse_args()
    run_server(port=args.port, directory=args.directory)

