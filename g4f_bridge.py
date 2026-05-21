"""Bridge: reads JSON from stdin, calls gpt4free, writes JSON lines to stdout."""
import sys, json
sys.stdout.reconfigure(line_buffering=True)

from g4f.client import AsyncClient
from g4f.Provider import Yqcloud
import asyncio

async def main():
    req = json.loads(sys.stdin.read())
    messages = req.get("messages", [{"role": "user", "content": "hi"}])

    client = AsyncClient()
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini", messages=messages, provider=Yqcloud, stream=True, timeout=30
        )
        async for chunk in response:
            if hasattr(chunk, "choices") and chunk.choices:
                content = chunk.choices[0].delta.content or ""
                if content:
                    print(json.dumps({"content": content}), flush=True)
    except Exception as e:
        print(json.dumps({"error": str(e)}), flush=True)

asyncio.run(main())
