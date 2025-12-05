export class Router {
  constructor() {
    this.routes = {
      GET: [],
      POST: [],
      PUT: [],
      DELETE: [],
    };
  }

  // --- Registration methods ---
  get(path, handler) {
    this.#register("GET", path, handler);
  }

  post(path, handler) {
    this.#register("POST", path, handler);
  }

  put(path, handler) {
    this.#register("PUT", path, handler);
  }

  delete(path, handler) {
    this.#register("DELETE", path, handler);
  }

  #register(method, path, handler) {
    const parts = path.split("/").filter(Boolean);

    this.routes[method].push({
      path,
      parts,
      handler
    });
  }

  // --- Matching ---
  match(method, reqPath) {
    const incoming = reqPath.split("/").filter(Boolean);
    const candidates = this.routes[method] || [];

    for (const route of candidates) {
      if (this.#matches(route.parts, incoming)) {
        const params = this.#extractParams(route.parts, incoming);
        return { handler: route.handler, params };
      }
    }

    return null; // no match
  }

  // /users/:id vs /users/123
  #matches(routeParts, incomingParts) {
    if (routeParts.length !== incomingParts.length) return false;

    for (let i = 0; i < routeParts.length; i++) {
      const rp = routeParts[i];
      const ip = incomingParts[i];

      if (rp.startsWith(":")) continue; // wildcard match
      if (rp !== ip) return false;
    }

    return true;
  }

  #extractParams(routeParts, incomingParts) {
    const params = {};
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(":")) {
        const key = routeParts[i].slice(1);
        params[key] = incomingParts[i];
      }
    }
    return params;
  }
}
