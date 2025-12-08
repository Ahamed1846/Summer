import net from "net";
import { Request } from "./request.js";
import { Response } from "./response.js";
import { router } from "./index.js";

import "../app.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const HOST = "0.0.0.0";

const server = net.createServer((socket) => {
  const remote = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`[conn] new connection from ${remote}`);

  let buffer = Buffer.alloc(0);

  // Idle timeout for keep-alive clients
  socket.setTimeout(5000);
  socket.on("timeout", () => {
    console.log(`[timeout] closing idle connection ${remote}`);
    socket.end();
  });

  socket.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    while (true) {
      const headerEnd = buffer.indexOf(Buffer.from("\r\n\r\n"));
      if (headerEnd === -1) return; // Wait for more data

      let req;
      try {
        req = new Request(buffer);
      } catch (err) {
        console.error("[parser] invalid request:", err.message);
        socket.end(); 
        return;
      }

      console.log(`[req] ${req.method} ${req.path} HTTP/${req.httpVersion}`);

      const res = new Response(socket);

      // Detect keep-alive
      const wantsKeepAlive =
        req.headers["connection"] &&
        req.headers["connection"].toLowerCase() === "keep-alive";

      res.setKeepAlive(wantsKeepAlive);

      // Route matching
      const match = router.match(req.method, req.path);

      if (!match) {
        res.status(404).text("Route not found");
      } else {
        req.params = match.params;
        match.handler(req, res);
      }

      // Calculate how many bytes belong to this request
      const consumed = headerEnd + 4 + req.body.length;
      buffer = buffer.slice(consumed);

      // If no more complete requests in buffer → wait for next data
      if (buffer.length === 0) break;
    }
  });

  socket.on("end", () => {
    console.log(`[conn] ended ${remote}`);
  });

  socket.on("error", (err) => {
    console.error(`[conn] error ${remote}:`, err);
  });
});

server.on("error", (err) => {
  console.error("[server] fatal error:", err);
});

server.listen(PORT, HOST, () => {
  console.log(`Summer TCP server listening on ${HOST}:${PORT}`);
  console.log(`Try: curl -v http://127.0.0.1:${PORT}/`);
});
