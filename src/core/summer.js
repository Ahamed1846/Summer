import net from 'net';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const HOST = '0.0.0.0';
const SERVER_NAME = 'Summer/0.1';

function makeSimpleHttpResponse(body = 'Hello from Summer v0.1') {

  const payload = String(body);
  return [
    'HTTP/1.1 200 OK',
    `Date: ${new Date().toUTCString()}`,
    'Content-Type: text/plain; charset=utf-8',
    `Content-Length: ${Buffer.byteLength(payload, 'utf8')}`,
    `Server: ${SERVER_NAME}`,
    'Connection: close',
    '',
    payload
  ].join('\r\n');
}

const server = net.createServer((socket) => {
  const remote = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`[conn] new connection from ${remote}`);

  let buffer = Buffer.alloc(0);

  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    const snippet = buffer.length > 1024 ? buffer.slice(0, 1024) : buffer;
    console.log(`[data] ${remote} -> ${snippet.toString('utf8')}`);

    const response = makeSimpleHttpResponse(`Summer v0.1 — Hello from ${remote}`);
    socket.write(response, () => {
      socket.end();
    });
  });

  socket.on('end', () => {
    console.log(`[conn] ended ${remote}`);
  });

  socket.on('error', (err) => {
    console.error(`[conn] error ${remote}:`, err);
  });

});

server.on('error', (err) => {
  console.error('[server] fatal error:', err);
});

server.listen(PORT, HOST, () => {
  console.log(`Summer TCP server listening on ${HOST}:${PORT}`);
  console.log(`Try: curl -v http://127.0.0.1:${PORT}/`);
});
