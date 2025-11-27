export class Request {
  constructor(raw) {
    this.raw = raw;
    this.method = null;
    this.path = null;
    this.httpVersion = null;
    this.headers = {};
    this.body = Buffer.alloc(0);

    this.#parse();
  }

  #parse() {
    const rawString = this.raw.toString('utf8');

    const headerEnd = rawString.indexOf('\r\n\r\n');
    if (headerEnd === -1) {
      throw new Error('Invalid HTTP request: headers not terminated properly');
    }

    const headerSection = rawString.slice(0, headerEnd);
    const bodySection = this.raw.slice(headerEnd + 4);

    const lines = headerSection.split('\r\n');
    const requestLine = lines[0];
    const headerLines = lines.slice(1);

    const [method, path, httpVersion] = requestLine.split(' ');
    this.method = method;
    this.path = path;
    this.httpVersion = httpVersion.replace('HTTP/', '');

    for (const line of headerLines) {
      const [key, ...rest] = line.split(':');
      this.headers[key.trim().toLowerCase()] = rest.join(':').trim();
    }

    const contentLength = Number(this.headers['content-length'] || 0);
    if (contentLength > 0) {
      this.body = bodySection.slice(0, contentLength);
    }
  }
}
