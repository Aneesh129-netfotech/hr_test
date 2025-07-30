import os
import json
import httpx
from dotenv import load_dotenv
from schemas.test_schemas import TestRequest

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
JOB_SUMMARY_API_URL = "http://localhost:5000/api/jd/get-jd-summary/68870990e214ee4cab4957db"
JOB_SUMMARY_API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4N2UwZDFkOGVkZWRlM2I1NDc4MDc0ZiIsImlhdCI6MTc1MzY4MTIwNCwiZXhwIjoxNzU0Mjg2MDA0fQ.jcP5i8d66SM1LCfGnSgdcZTVPV1QSgqnqVn0QP4pvNc"  # Hardcoded token

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

async def fetch_job_summary():
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {JOB_SUMMARY_API_TOKEN}",  # Use hardcoded token
                "Content-Type": "application/json",
            }
            response = await client.get(JOB_SUMMARY_API_URL, headers=headers)
            print(f"🔵 Job Summary API | Status:", response.status_code)
            response.raise_for_status()
            data = response.json()
            return data.get("jobSummary")  # Extract only the jobSummary field
    except Exception as e:
        print(f"❌ Job Summary API failed:", e)
        return None

async def generate_questions(request: TestRequest):
    # Fetch job summary from the Node.js API
    job_summary = await fetch_job_summary()
    if not job_summary:
        print("⚠️ Failed to fetch job summary, using fallback mock data")
        job_summary = "Mock job summary: Python developer role requiring skills in web development and data analysis."
    
    # Assign job summary to request.topic to maintain schema compatibility
    request.topic = job_summary

    if request.question_type == "coding":
        prompt = (
            f"Generate {request.num_questions} {request.difficulty} level coding questions "
            f"based on the job summary: '{request.topic}'. Respond only as a JSON array of objects. "
            "Each object should have: `question` (coding problem statement), `answer` (expected code/logic). "
            "Do NOT include explanations. Keep questions practical and relevant to the job summary."
        )
    elif request.question_type == "mixed":
        mcq_count = getattr(request, "mcq_count", request.num_questions // 2)
        coding_count = getattr(request, "coding_count", request.num_questions - mcq_count)

        prompt = (
            f"Generate a mixed set of {mcq_count + coding_count} {request.difficulty} level questions "
            f"based on the job summary: '{request.topic}'. Include exactly {mcq_count} multiple choice questions and "
            f"{coding_count} coding questions.\n\n"
            "Each MCQ should include: `question`, `options` (list of 4), and `answer`.\n"
            "Each coding question should include: `question` and `answer` (code or logic).\n"
            "Respond only with a JSON array of such objects. No extra commentary."
        )

    else:  # default to MCQ
        prompt = (
            f"Generate {request.num_questions} {request.difficulty} level multiple choice questions "
            f"based on the job summary: '{request.topic}'. "
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