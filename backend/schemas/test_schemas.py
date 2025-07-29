from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

class Question(BaseModel):
    question: str
    options: Optional[List[str]] = None
    answer: Optional[str] = None

class TestRequest(BaseModel):
    topic: str
    difficulty: str
    num_questions: int
    question_type: Optional[str] = "mcq"  # values: "mcq", "coding", "mixed"
    mcq_count: Optional[int] = 0
    coding_count: Optional[int] = 0

class TestFinalizeRequest(BaseModel):
    questions: List[Question]  # Expect list of question dicts

class TestSubmission(BaseModel):
    question_set_id: UUID  # UUID, not str
    questions: List[Question]
    answers: List[str]
    languages: Optional[List[str]] = None  # Added for coding language support