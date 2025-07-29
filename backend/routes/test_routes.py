# backend/routes/test_routes.py

from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from db.supabase import supabase
from schemas.test_schemas import TestSubmission
from services.test_evaluator import evaluate_test

router = APIRouter()


@router.get("/{question_set_id}")
async def fetch_test(question_set_id: str):
    res = supabase.table("question_sets").select("*").eq("id", question_set_id).execute()
    print("📄 Supabase question_set response:", res)

    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Test not found")

    test_info = res.data[0]
    expires_at = test_info.get("expires_at")

    now = datetime.now(timezone.utc)
    expires_dt = datetime.fromisoformat(expires_at)

    if now > expires_dt:
        raise HTTPException(status_code=410, detail="Test expired")

    q_res = supabase.table("questions").select("question, options").eq("question_set_id", question_set_id).execute()

    if not q_res.data:
        raise HTTPException(status_code=404, detail="No questions found")

    return {"questions": q_res.data}


@router.post("/submit")
async def submit_test(submission: TestSubmission):
    print("📨 Received test submission:", submission.dict())

    # Evaluate the test
    result = await evaluate_test(submission)
    print("✅ Evaluation result:", result)

    # Always try to save the result, even if evaluation had issues
    try:
        # Prepare data for database insertion
        insert_data = {
            "question_set_id": str(submission.question_set_id),
            "score": result.get("score", 0),
            "max_score": result.get("max_score", len(submission.questions) * 10),
            "percentage": result.get("percentage", 0.0),
            "status": result.get("status", "Fail"),
            "total_questions": len(submission.questions),
            "raw_feedback": result.get("raw_feedback", "")
        }
        
        # Insert into database
        db_result = supabase.table("test_results").insert(insert_data).execute()
        print("💾 Saved to database:", db_result.data[0] if db_result.data else "No data returned")
        
        # Add the database ID to the result
        if db_result.data:
            result["result_id"] = db_result.data[0].get("id")
            
    except Exception as e:
        print("❌ Error inserting into Supabase:", e)
        # Don't raise an exception here - we still want to return the evaluation result
        # Just log the error and continue
        result["database_error"] = str(e)

    # Return the evaluation result (with additional fields)
    return {
        "score": result.get("score", 0),
        "max_score": result.get("max_score", len(submission.questions) * 10),
        "percentage": result.get("percentage", 0.0),
        "status": result.get("status", "Fail"),
        "raw_feedback": result.get("raw_feedback", ""),
        "result_id": result.get("result_id"),
        "database_error": result.get("database_error")
    }