"""Minimal FastAPI server wrapping gpt4free for chat completions."""
import json, os
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, JSONResponse
import uvicorn
from g4f.client import AsyncClient
from g4f.Provider import Yqcloud, ItalyGPT, WeWordle

app = FastAPI()
client = AsyncClient()

PROVIDERS = {
    "Yqcloud": Yqcloud,
    "ItalyGPT": ItalyGPT,
    "WeWordle": WeWordle,
}

@app.post("/v1/chat/completions")
async def chat_completions(req: Request):
    body = await req.json()
    model = body.get("model", "gpt-4o-mini")
    messages = body.get("messages", [])
    provider_name = body.get("provider", "Yqcloud")
    provider_cls = PROVIDERS.get(provider_name)
    if not provider_cls:
        return JSONResponse({"error": f"Unknown provider: {provider_name}"}, status_code=400)

    async def generate():
        try:
            response = client.chat.completions.create(
                model=model, messages=messages,
                provider=provider_cls, timeout=60,
            )
            async for chunk in response:
                if chunk.choices:
                    c = chunk.choices[0].delta.content or ""
                    if c:
                        yield f"data: {json.dumps({'content': c})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 1337))
    uvicorn.run(app, host="0.0.0.0", port=port)
