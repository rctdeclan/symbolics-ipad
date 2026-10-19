import assert from "node:assert/strict";
import { createServer, preview } from "vite";

async function read(server, path) {
  const address = server.httpServer.address();
  const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
    signal: AbortSignal.timeout(10000)
  });
  const body = await response.text();
  assert.equal(response.status, 200, `${path}: ${body.slice(0, 300)}`);
  return { response, body };
}

const development = await createServer({
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { host: "127.0.0.1", port: 0, open: false }
});

try {
  await development.listen();
  const { body } = await read(development, "/");
  assert.match(body, /\/src\/main\.jsx/);
  for (const path of ["/src/main.jsx", "/src/App.jsx", "/src/Dragon.jsx", "/src/components/spatial/SpatialScene.jsx"]) {
    const module = await read(development, path);
    assert.match(module.response.headers.get("content-type"), /javascript/);
  }
  await read(development, "/manifest.json");
  console.log("Development server: HTML, entry modules, spatial renderer, and manifest served.");
} finally {
  await development.close();
}

// Requires npm run build first. This checks the emitted assets, not DOM execution.
const production = await preview({
  preview: { host: "127.0.0.1", port: 0, open: false }
});

try {
  const { body } = await read(production, "/");
  const assets = [...body.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)];
  assert.ok(assets.some(([, path]) => path.endsWith(".js")), "Built JavaScript entry is missing");
  for (const [, path] of assets) {
    await read(production, path);
  }
  await read(production, "/favicon.ico");
  console.log("Production preview: HTML, bundled assets, and favicon served.");
} finally {
  await new Promise((resolve, reject) => {
    production.httpServer.close((error) => error ? reject(error) : resolve());
    production.httpServer.closeAllConnections();
  });
}
