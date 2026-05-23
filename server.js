import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const distRoot = join(root, "dist");
const storageRoot = join(root, "storage");
const cachePath = join(storageRoot, "answer-cache.json");
const keysPath = join(storageRoot, "api-keys.json");

const host = process.env.OCTOPUS_HOST ?? "127.0.0.1";
const port = Number(process.env.OCTOPUS_PORT ?? "8791");
const provider = process.env.OCTOPUS_PROVIDER ?? "ollama";
const model = process.env.OCTOPUS_MODEL ?? "qwen2.5:7b-instruct";
const ollamaUrl = trimTrailingSlash(process.env.OCTOPUS_OLLAMA_URL ?? "http://127.0.0.1:11434");
const openAiBaseUrl = trimTrailingSlash(process.env.OCTOPUS_BASE_URL ?? "https://api.openai.com/v1");
const modelApiKey = process.env.OCTOPUS_MODEL_API_KEY ?? process.env.OPENAI_API_KEY ?? "";
const allowedOrigin = process.env.OCTOPUS_ALLOWED_ORIGIN ?? "*";
const adminKey = process.env.OCTOPUS_ADMIN_KEY ?? "";
const localKeygenEnabled = (process.env.OCTOPUS_ALLOW_LOCAL_KEYGEN ?? "true") !== "false";
const envApiKeys = (process.env.OCTOPUS_API_KEYS ?? "")
  .split(",")
  .map((key) => key.trim())
  .filter(Boolean);

const systemPrompt =
  process.env.OCTOPUS_SYSTEM_PROMPT ??
  [
    "You are Octopus, a private AI workspace for one owner and their connected AI systems.",
    "Be clear, useful, honest about limits, and concise unless more detail is needed.",
    "When another AI asks you for help, answer in a way that is easy for machines and humans to use.",
  ].join(" ");

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".ico", "image/x-icon"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

const server = createServer(async (request, response) => {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? `${host}:${port}`}`);

  try {
    if (url.pathname === "/api/health" && request.method === "GET") {
      const keyVault = await readKeyVault();
      const cache = await readAnswerCache();

      sendJson(response, 200, {
        status: "ok",
        provider,
        model,
        authRequired: envApiKeys.length + keyVault.keys.length > 0,
        storedApiKeys: keyVault.keys.length,
        cachedAnswers: Object.keys(cache.items).length,
        localKeygenEnabled,
        endpoints: ["POST /api/chat", "POST /api/octopus", "POST /api/keys"],
      });
      return;
    }

    if ((url.pathname === "/api/chat" || url.pathname === "/api/octopus") && request.method === "POST") {
      if (!(await isAuthorized(request))) {
        sendJson(response, 401, {
          error: "Octopus API key required. Send Authorization: Bearer YOUR_OCTOPUS_KEY.",
        });
        return;
      }

      const body = await readJsonBody(request);
      const messages = normalizeMessages(body);
      const cacheKey = createCacheKey(body, messages);
      const cached = body.cache === false ? null : await getCachedAnswer(cacheKey);

      if (cached) {
        sendModelAnswer(response, {
          answer: cached.answer,
          body,
          cache: {
            hit: true,
            key: cacheKey,
            storedAt: cached.createdAt,
            hits: cached.hits,
          },
        });
        return;
      }

      const answer = await runModel(messages);

      if (body.cache !== false) {
        await storeCachedAnswer(cacheKey, {
          answer,
          provider,
          model,
          question: latestUserContent(messages),
          createdAt: new Date().toISOString(),
          hits: 0,
          lastHitAt: null,
        });
      }

      sendModelAnswer(response, {
        answer,
        body,
        cache: { hit: false, key: cacheKey, storedAt: null, hits: 0 },
      });
      return;
    }

    if (url.pathname === "/api/keys" && request.method === "GET") {
      if (!isAdminAuthorized(request)) {
        sendJson(response, 403, { error: adminHelpText() });
        return;
      }

      const keyVault = await readKeyVault();
      sendJson(response, 200, { keys: keyVault.keys.map(redactKeyRecord) });
      return;
    }

    if (url.pathname === "/api/keys" && request.method === "POST") {
      if (!isAdminAuthorized(request)) {
        sendJson(response, 403, { error: adminHelpText() });
        return;
      }

      const body = await readJsonBody(request);
      const created = await createApiKey(String(body.name ?? "AI client").slice(0, 80));

      sendJson(response, 201, {
        key: created.key,
        record: redactKeyRecord(created.record),
        warning: "This key is shown once. Save it in your AI client, not in GitHub.",
      });
      return;
    }

    if (url.pathname.startsWith("/api/keys/") && request.method === "DELETE") {
      if (!isAdminAuthorized(request)) {
        sendJson(response, 403, { error: adminHelpText() });
        return;
      }

      const id = decodeURIComponent(url.pathname.replace("/api/keys/", ""));
      const removed = await deleteApiKey(id);
      sendJson(response, removed ? 200 : 404, {
        removed,
        id,
      });
      return;
    }

    if (url.pathname === "/api/cache/stats" && request.method === "GET") {
      if (!(await isAuthorized(request))) {
        sendJson(response, 401, {
          error: "Octopus API key required. Send Authorization: Bearer YOUR_OCTOPUS_KEY.",
        });
        return;
      }

      const cache = await readAnswerCache();
      sendJson(response, 200, {
        cachedAnswers: Object.keys(cache.items).length,
        answers: Object.entries(cache.items)
          .slice(-20)
          .map(([key, item]) => ({
            key,
            question: item.question,
            provider: item.provider,
            model: item.model,
            createdAt: item.createdAt,
            hits: item.hits,
            lastHitAt: item.lastHitAt,
          })),
      });
      return;
    }

    if (url.pathname === "/api/cache/clear" && request.method === "POST") {
      if (!isAdminAuthorized(request)) {
        sendJson(response, 403, { error: adminHelpText() });
        return;
      }

      await writeAnswerCache({ version: 1, items: {} });
      sendJson(response, 200, { cleared: true });
      return;
    }

    if (url.pathname.startsWith("/api/")) {
      sendJson(response, 404, { error: "Unknown Octopus API route." });
      return;
    }

    await serveStatic(url.pathname, response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error.";
    sendJson(response, 500, { error: message });
  }
});

server.listen(port, host, async () => {
  await ensureStorage();
  const keyVault = await readKeyVault();
  const cache = await readAnswerCache();
  console.log(`Octopus server running at http://${host}:${port}/`);
  console.log(`Provider: ${provider}; model: ${model}`);
  console.log(`API keys: ${envApiKeys.length + keyVault.keys.length}; cached answers: ${Object.keys(cache.items).length}`);
});

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Octopus-Key");
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload, null, 2));
}

function sendModelAnswer(response, { answer, body, cache }) {
  const payload = {
    answer,
    message: { role: "assistant", content: answer },
    createdAt: new Date().toISOString(),
    conversationId: body.conversationId ?? null,
  };

  if (body.debug === true) {
    payload.provider = provider;
    payload.model = model;
    payload.cache = cache;
  }

  sendJson(response, 200, payload);
}

async function isAuthorized(request) {
  const keyVault = await readKeyVault();
  if (envApiKeys.length + keyVault.keys.length === 0) return true;

  const candidate = getPresentedKey(request);
  if (!candidate) return false;

  if (envApiKeys.some((key) => safeStringEqual(candidate, key))) {
    return true;
  }

  const candidateHash = hashText(candidate);
  const matched = keyVault.keys.find((record) => safeStringEqual(candidateHash, record.hash));

  if (!matched) return false;

  matched.lastUsedAt = new Date().toISOString();
  await writeKeyVault(keyVault);
  return true;
}

function isAdminAuthorized(request) {
  const candidate = getPresentedKey(request);

  if (adminKey) {
    return Boolean(candidate && safeStringEqual(candidate, adminKey));
  }

  return localKeygenEnabled && isLocalRequest(request);
}

function getPresentedKey(request) {
  const authHeader = request.headers.authorization ?? "";
  const bearer = authHeader.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  const headerKey = request.headers["x-octopus-key"];
  const candidate = Array.isArray(headerKey) ? headerKey[0] : headerKey;
  return bearer || candidate?.trim() || "";
}

function isLocalRequest(request) {
  const remoteAddress = request.socket.remoteAddress ?? "";
  return ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(remoteAddress);
}

function adminHelpText() {
  return adminKey
    ? "Admin key required. Send Authorization: Bearer YOUR_OCTOPUS_ADMIN_KEY."
    : "Admin key generation is only open from localhost. Set OCTOPUS_ADMIN_KEY before publishing.";
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1024 * 1024) {
      throw new Error("Request body is too large.");
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

function normalizeMessages(body) {
  const inputMessages = Array.isArray(body.messages)
    ? body.messages
    : typeof body.message === "string"
      ? [{ role: "user", content: body.message }]
      : [];

  const messages = inputMessages
    .map((message) => ({
      role: ["system", "user", "assistant", "tool"].includes(message.role) ? message.role : "user",
      content: String(message.content ?? "").trim(),
    }))
    .filter((message) => message.content);

  if (messages.length === 0) {
    throw new Error("Send either `message` or `messages`.");
  }

  if (!messages.some((message) => message.role === "system")) {
    messages.unshift({ role: "system", content: systemPrompt });
  }

  return messages;
}

function createCacheKey(body, messages) {
  const userMessages = messages.filter((message) => message.role === "user");
  const latestUserMessage = latestUserContent(messages);
  const cacheInput =
    typeof body.message === "string" || userMessages.length <= 1
      ? `question:${normalizeCacheText(latestUserMessage)}`
      : `conversation:${JSON.stringify(messages)}`;

  return hashText(
    JSON.stringify({
      version: 1,
      provider,
      model,
      systemPromptHash: hashText(systemPrompt),
      cacheInput,
    }),
  );
}

function normalizeCacheText(value) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function latestUserContent(messages) {
  return [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
}

async function getCachedAnswer(cacheKey) {
  const cache = await readAnswerCache();
  const item = cache.items[cacheKey];
  if (!item) return null;

  item.hits = Number(item.hits ?? 0) + 1;
  item.lastHitAt = new Date().toISOString();
  await writeAnswerCache(cache);
  return item;
}

async function storeCachedAnswer(cacheKey, item) {
  const cache = await readAnswerCache();
  cache.items[cacheKey] = item;
  await writeAnswerCache(cache);
}

async function createApiKey(name) {
  const key = `octo_${randomBytes(32).toString("base64url")}`;
  const keyVault = await readKeyVault();
  const record = {
    id: randomBytes(8).toString("hex"),
    name: name || "AI client",
    prefix: key.slice(0, 12),
    hash: hashText(key),
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  };

  keyVault.keys.push(record);
  await writeKeyVault(keyVault);
  return { key, record };
}

async function deleteApiKey(id) {
  const keyVault = await readKeyVault();
  const before = keyVault.keys.length;
  keyVault.keys = keyVault.keys.filter((record) => record.id !== id);

  if (keyVault.keys.length === before) {
    return false;
  }

  await writeKeyVault(keyVault);
  return true;
}

function redactKeyRecord(record) {
  return {
    id: record.id,
    name: record.name,
    prefix: `${record.prefix}...`,
    createdAt: record.createdAt,
    lastUsedAt: record.lastUsedAt,
  };
}

async function runModel(messages) {
  if (provider === "ollama") {
    return runOllama(messages);
  }

  if (provider === "openai-compatible") {
    return runOpenAiCompatible(messages);
  }

  return runMock(messages);
}

async function runOllama(messages) {
  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: { temperature: 0.4 },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama error ${response.status}: ${text || response.statusText}`);
  }

  const data = await response.json();
  const content = data.message?.content ?? data.response ?? "";

  if (!content.trim()) {
    throw new Error("Ollama returned an empty response.");
  }

  return content;
}

async function runOpenAiCompatible(messages) {
  if (!modelApiKey) {
    throw new Error("OCTOPUS_MODEL_API_KEY is required for openai-compatible provider mode.");
  }

  const response = await fetch(`${openAiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${modelApiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Model API error ${response.status}: ${text || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";

  if (!content.trim()) {
    throw new Error("Model API returned an empty response.");
  }

  return content;
}

function runMock(messages) {
  const latestUserMessage = latestUserContent(messages);

  if (/^(hi|hello|hey)\b/i.test(latestUserMessage.trim())) {
    return "Hi. I'm Octopus. What do you want to work on?";
  }

  if (!latestUserMessage.trim()) {
    return "I'm here. Send me a question or task.";
  }

  return "I understand. Tell me the goal, the context, and what kind of answer you want, and I will help.";
}

async function serveStatic(pathname, response) {
  const requestedPath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  let filePath = join(distRoot, safePath);

  if (!filePath.startsWith(distRoot)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(distRoot, "index.html");
  }

  if (!existsSync(filePath)) {
    sendJson(response, 503, {
      error: "Frontend build not found. Run `npm run build`, then restart `npm run server`.",
    });
    return;
  }

  const contentType = mimeTypes.get(extname(filePath)) ?? "application/octet-stream";
  response.writeHead(200, { "Content-Type": contentType });
  createReadStream(filePath).pipe(response);
}

async function readAnswerCache() {
  return readJsonFile(cachePath, { version: 1, items: {} });
}

async function writeAnswerCache(cache) {
  await writeJsonFile(cachePath, cache);
}

async function readKeyVault() {
  return readJsonFile(keysPath, { version: 1, keys: [] });
}

async function writeKeyVault(keyVault) {
  await writeJsonFile(keysPath, keyVault);
}

async function readJsonFile(path, fallback) {
  await ensureStorage();

  try {
    const content = await readFile(path, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return structuredClone(fallback);
    }
    throw error;
  }
}

async function writeJsonFile(path, data) {
  await ensureStorage();
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function ensureStorage() {
  await mkdir(storageRoot, { recursive: true });
}

function hashText(value) {
  return createHash("sha256").update(value).digest("hex");
}

function safeStringEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function trimTrailingSlash(value) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}
