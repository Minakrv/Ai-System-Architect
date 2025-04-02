from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

router = APIRouter()

# Request body model
class ArchitectureRequest(BaseModel):
    system_description: str
    constraints: str

@router.post("/generate-architecture")
async def generate_architecture(data: ArchitectureRequest):
    prompt = f"""
You are a senior system architect.

Generate exactly **3** possible architecture solutions for the following system.

**System Description**: {data.system_description}  
**Constraints**: {data.constraints}

For each architecture, include:
1. Title: "Architecture Option X"
2. Stack (tech/language/frameworks)
3. Summary
4. ✅ Pros (start with "Pros:" followed by bullet points)
5. ❌ Cons (start with "Cons:" followed by bullet points)
6. A mermaid diagram in this format:

```mermaid
graph TD;
  User[User] --> UI[Next.js Frontend]
  UI --> API[Node.js Backend]
  API --> DB[(PostgreSQL)]
  API --> Cache[Redis]
  API --> Queue[RabbitMQ]
  Queue --> Worker[Job Processor]
  API --> Storage[S3 Bucket]
```

Respond in valid Markdown. Your response will be parsed and rendered live in the frontend.
"""

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openai/gpt-3.5-turbo",  # ✅ Public model, works without approval
                    "messages": [
                        {"role": "system", "content": "You are a helpful architecture assistant."},
                        {"role": "user", "content": prompt}
                    ]
                }
            )

            # If not successful, show full response
            if response.status_code != 200:
                print("❌ OpenRouter Error Response:", response.text)
                raise HTTPException(status_code=500, detail=response.text)

            result = response.json()
            print("✅ AI Result:", result["choices"][0]["message"]["content"])
            return {"result": result["choices"][0]["message"]["content"]}

    except Exception as e:
        print("❌ Exception occurred:", str(e))
        raise HTTPException(status_code=500, detail=str(e))