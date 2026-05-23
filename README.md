# Octopus

Octopus is a private AI workspace and model gateway. It includes a React/Tailwind frontend, a private chat console, and a Node API that another AI can call.

## Run the interface

```powershell
npm.cmd install
npm.cmd run build
npm.cmd run server
```

Open `http://127.0.0.1:8791/`.

## Connect a local model with Ollama

Install Ollama, then pull a model:

```powershell
ollama pull qwen2.5:7b-instruct
```

Start Octopus with Ollama:

```powershell
$env:OCTOPUS_PROVIDER="ollama"
$env:OCTOPUS_MODEL="qwen2.5:7b-instruct"
$env:OCTOPUS_API_KEYS="your-long-private-key"
npm.cmd run server
```

## Pair another AI with Octopus

Create an API key locally:

```bash
curl http://127.0.0.1:8791/api/keys \
  -H "Content-Type: application/json" \
  -d '{"name":"my-private-ai"}'
```

When published, protect key creation with `OCTOPUS_ADMIN_KEY` and call the same route with:

```bash
Authorization: Bearer your-admin-key
```

Send a signed request to `POST /api/octopus`:

```bash
curl http://127.0.0.1:8791/api/octopus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-long-private-key" \
  -d '{"message":"Octopus, answer this for my private AI."}'
```

The response includes `answer`, `provider`, `model`, and `createdAt`.

Revoke a key:

```bash
curl -X DELETE http://127.0.0.1:8791/api/keys/YOUR_KEY_ID
```

## Answer storage

Octopus caches answers in `storage/answer-cache.json`. If the same question is asked again with the same model settings, Octopus returns the saved answer instead of calling the model again. Generated API keys are stored as hashes in `storage/api-keys.json`.

Do not commit the `storage/` directory. It is ignored by Git.

## Training recommendation

Do not start with fine-tuning. Start with retrieval-augmented generation: upload or index your files, retrieve relevant chunks, and send them into the model as context. Fine-tuning is only worth adding later if Octopus needs a permanent behavior, style, or domain skill that prompting and retrieval cannot handle.
