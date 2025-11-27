# Summer

Summer is a from-scratch HTTP server built directly on top of raw TCP sockets. It implements core request handling components manually and provides the foundation for routing, middleware, load balancing, and reverse proxying—without using Node's `http` module or external frameworks.

All major components are implemented manually, including:

* TCP connection handling
* HTTP request parsing
* HTTP response construction
* Routing
* Middleware pipeline
* Load balancing algorithms
* Reverse proxying

Development follows a milestone-based structure.
Progress is tracked in `PROJECT_PROGRESS.md`.

## Usage

```bash
npm install
npm start
```

Test:

```bash
curl -v http://localhost:8080/
```
