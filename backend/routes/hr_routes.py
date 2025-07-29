from fastapi import APIRouter, HTTPException
from schemas.test_schemas import TestRequest, TestFinalizeRequest
from services.test_generator import generate_questions
from db.supabase import supabase
from uuid import uuid4
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/generate-test")
async def create_test(request: TestRequest):
    # Generate questions using LLM
    questions = await generate_questions(request)
    return {"questions": questions}

@router.post("/finalize-test")
async def finalize_test(request: TestFinalizeRequest):
    question_set_id = str(uuid4())
    created_at = datetime.utcnow()
    expires_at = created_at + timedelta(hours=2)

    # Insert into question_sets
    supabase.table("question_sets").insert({
        "id": question_set_id,
        "created_at": created_at.isoformat(),
        "expires_at": expires_at.isoformat()
    }).execute()

    # Insert questions linked to this set
    for q in request.questions:
        supabase.table("questions").insert({
            "question_set_id": question_set_id,
            "question": q.question,        # ✅ Access attributes
            "options": q.options,          # ✅ Might be None
            "answer": q.answer,            # ✅ Optional
            "created_at": created_at.isoformat(),
            "expires_at": expires_at.isoformat()
        }).execute()

    test_link = f"http://localhost:5173/test/{question_set_id}"
    return {"test_link": test_link}

