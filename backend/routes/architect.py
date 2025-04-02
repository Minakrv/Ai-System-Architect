from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
import os
import httpx
import uuid
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.db import get_db
from db.models import Architecture

# Load environment variables
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

router = APIRouter()

# Request body model
class ArchitectureRequest(BaseModel):
    system_description: str
    constraints: str

@router.post("/upload-file")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith(('.txt', '.md')):
        raise HTTPException(status_code=400, detail="Only .txt or .md files are supported")
    
    content = await file.read()
    decoded = content.decode('utf-8')
    
    return {
        "parsed_description": decoded[:1000],  # Limit preview
        "full_content": decoded
    }

@router.get("/architectures/{arch_id}/metrics")
async def get_architecture_metrics(arch_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Architecture).where(Architecture.id == uuid.UUID(arch_id)))
    arch = result.scalar_one_or_none()

    if not arch:
        raise HTTPException(status_code=404, detail="Architecture not found")

    text = arch.result

    # --- Simple keyword-based stack detection ---
    known_techs = [
        "React", "Vue", "Angular", "Next.js",
        "Node.js", "Python", "Flask", "Django", "Java", "Spring Boot",
        "Redis", "PostgreSQL", "MongoDB", "MySQL", "Kafka", "RabbitMQ",
        "S3", "Firebase", "AWS Lambda", "API Gateway", "Cloud Functions"
    ]

    stack_counts = {tech: text.count(tech) for tech in known_techs if tech in text}

    # --- Count services per architecture block ---
    architecture_blocks = text.split("### Architecture Option")
    service_counts = [block.count("graph TD") for block in architecture_blocks if block.strip()]

    # --- Is it frontend-heavy? ---
    frontend_keywords = ["React", "Vue", "Angular", "UI", "Frontend"]
    backend_keywords = ["Node.js", "Django", "Flask", "Spring", "API", "Backend", "Java", "Python"]

    frontend_score = sum(text.count(k) for k in frontend_keywords)
    backend_score = sum(text.count(k) for k in backend_keywords)

    is_frontend_heavy = frontend_score > backend_score

    # --- Does it use serverless? ---
    serverless_keywords = ["AWS Lambda", "Firebase", "Vercel", "Netlify", "Cloud Functions", "Serverless"]
    uses_serverless = any(kw in text for kw in serverless_keywords)

    return {
        "stack_counts": stack_counts,
        "average_service_count": round(sum(service_counts) / len(service_counts), 2) if service_counts else 0,
        "frontend_heavy": is_frontend_heavy,
        "uses_serverless": uses_serverless
    }

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