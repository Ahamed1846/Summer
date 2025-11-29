// src/core/response.js
// Builds HTTP responses in a structured way.

export class Response {
  constructor(socket) {
    this.socket = socket;

    this.statusCode = 200;
    this.headers = {
      'Server': 'Summer/0.1',
      'Connection': 'close'
    };

    this._body = null; // Buffer or string
    this._sent = false;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }

  // --- core sending functions ---

  send(data) {
    if (this._sent) return;
    this._sent = true;

    // Normalize to Buffer
    if (Buffer.isBuffer(data)) {
      this._body = data;
    } else {
      this._body = Buffer.from(String(data), 'utf8');
    }

    // Set content-length
    this.headers["Content-Length"] = this._body.length;

    // If no content-type set, default text/plain
    if (!this.headers["Content-Type"]) {
      this.headers["Content-Type"] = "text/plain; charset=utf-8";
    }

    // Build status line
    const statusLine = `HTTP/1.1 ${this.statusCode} ${this.#statusMessage(this.statusCode)}`;

    // Build header lines
    const headerLines = Object.entries(this.headers)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\r\n');

    // Final full response buffer
    const head = Buffer.from(statusLine + '\r\n' + headerLines + '\r\n\r\n');
    const full = Buffer.concat([head, this._body]);

    this.socket.write(full, () => {
      this.socket.end();
    });
  }

  // common convenience functions
  json(obj) {
    this.setHeader("Content-Type", "application/json; charset=utf-8");
    this.send(JSON.stringify(obj));
  }

  text(str) {
    this.setHeader("Content-Type", "text/plain; charset=utf-8");
    this.send(String(str));
  }

  html(str) {
    this.setHeader("Content-Type", "text/html; charset=utf-8");
    this.send(String(str));
  }

  // --- helper: map status codes to messages ---
  #statusMessage(code) {
    const messages = {
      200: "OK",
      201: "Created",
      204: "No Content",
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      500: "Internal Server Error"
    };
    return messages[code] || "OK";
  }
}
