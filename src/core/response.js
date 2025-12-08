export class Response {
  constructor(socket) {
    this.socket = socket;

    this.statusCode = 200;
    this.headers = {
      Server: "Summer/0.1",
      Connection: "close",
    };

    this._body = null;
    this._sent = false;
    this._keepAlive = false;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }

  setKeepAlive(flag) {
    this._keepAlive = flag;
    this.headers["Connection"] = flag ? "keep-alive" : "close";
  }

  send(data) {
    if (this._sent) return;
    this._sent = true;

    // Normalize body to Buffer
    if (Buffer.isBuffer(data)) {
      this._body = data;
    } else {
      this._body = Buffer.from(String(data), "utf8");
    }

    // Ensure content-type exists
    if (!this.headers["Content-Type"]) {
      this.headers["Content-Type"] = "text/plain; charset=utf-8";
    }

    // Set content length
    this.headers["Content-Length"] = this._body.length;

    // Build status line
    const statusLine = `HTTP/1.1 ${this.statusCode} ${this.#statusMessage(
      this.statusCode
    )}`;

    // Build headers
    const headerLines = Object.entries(this.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\r\n");

    // Combine head + body into one buffer
    const head = Buffer.from(statusLine + "\r\n" + headerLines + "\r\n\r\n");
    const full = Buffer.concat([head, this._body]);

    // Write response
    this.socket.write(full, () => {
      if (!this._keepAlive) {
        this.socket.end();
      }
      // else keep connection open for next request
    });
  }

  // ---- convenience helpers ----
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

  // ---- private ----
  #statusMessage(code) {
    const messages = {
      200: "OK",
      201: "Created",
      204: "No Content",
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      500: "Internal Server Error",
    };
    return messages[code] || "OK";
  }
}
