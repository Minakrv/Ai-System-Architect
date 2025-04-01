from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter()

class ArchitectureRequest(BaseModel):
    system_description: str
    constraints: str

@router.post("/generate-architecture")
async def generate_architecture(data: ArchitectureRequest):
    prompt = f"""
    You are a senior cloud architect. Given the system: "{data.system_description}" 
    and constraints: "{data.constraints}", generate 3 possible architecture designs.

    Each design should include:
    1. Short description
    2. Technologies used
    3. Mermaid.js diagram
    4. Pros & Cons (bullet points)
    """

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4-0613",
            messages=[
                {"role": "system", "content": "You are a helpful architecture assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        return {"result": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))