import os
import json
import httpx
from dotenv import load_dotenv
from schemas.test_schemas import TestRequest

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

async def call_model(model_name: str, prompt: str):
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    body = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": "You are a JSON-generating assistant."},
            {"role": "user", "content": prompt},
        ],
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=body)
            print(f"🔵 {model_name} | Status:", response.status_code)
            print("🔵 Response preview:", response.text[:200])

            response.raise_for_status()

            content = response.json()
            ai_text = content["choices"][0]["message"]["content"].strip()
            return json.loads(ai_text)

    except Exception as e:
        print(f"❌ {model_name} failed:", e)
        return None

async def generate_questions(request: TestRequest):
    if request.question_type == "coding":
        prompt = (
            f"Generate {request.num_questions} {request.difficulty} level coding questions "
            f"on the topic '{request.topic}'. Respond only as a JSON array of objects. "
            "Each object should have: `question` (coding problem statement), `answer` (expected code/logic). "
            "Do NOT include explanations. Keep questions practical and relevant."
        )
    elif request.question_type == "mixed":
        prompt = (
            f"Generate a mixed set of {request.num_questions} {request.difficulty} level questions "
            f"on the topic '{request.topic}'. Include both MCQs and coding problems. "
            "Each object should have: `question`, `options` (optional for MCQ), and `answer`. "
            "Return only a valid JSON array of such objects."
        )
    else:  # default to MCQ
        prompt = (
            f"Generate {request.num_questions} {request.difficulty} level multiple choice questions "
            f"on the topic '{request.topic}'. "
            "Respond only as a valid JSON array of objects. Each object should have the keys: "
            "`question`, `options` (a list of 4 options), and `answer` (exact match with one of the options)."
        )

    result = await call_model("qwen/qwen3-coder:free", prompt)

    if not result:
        print("⚠️ Falling back to mistralai/mistral-7b-instruct:free")
        result = await call_model("mistralai/mistral-7b-instruct:free", prompt)

    if not result:
        result = [
            {
                "question": "Mock Question: What is Python?",
                "options": ["A programming language", "A snake", "A car", "A song"],
                "answer": "A programming language"
            }
        ]

    return result
