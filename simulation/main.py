from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import uuid

app = FastAPI()

# --- CORS Configuration ---
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models ---

class Task(BaseModel):
    task_id: str
    policy_id: str
    rule_id: str
    task_name: str
    assigned_role: str
    status: str = "CREATED"
    deadline: str

class AuditLog(BaseModel):
    log_id: str
    task_id: str
    action: str
    performed_by_role: str
    timestamp: str

class TaskUpdate(BaseModel):
    status: str
    role: str # The role performing the action

# --- In-Memory Storage ---
tasks: List[Task] = []
audit_logs: List[AuditLog] = []

# --- Helper Functions ---

def log_audit_event(task_id: str, action: str, role: str):
    """
    Appends a new audit log entry.
    Audit logs are append-only.
    """
    log_entry = AuditLog(
        log_id=f"L{uuid.uuid4().hex[:8].upper()}",
        task_id=task_id,
        action=action,
        performed_by_role=role,
        timestamp=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    )
    audit_logs.append(log_entry)
    # print(f"AUDIT LOG: {log_entry.model_dump()}") # Optional: debug output

# --- Green Baseline Endpoint ---

@app.get("/health")
def health_check():
    return {"status": "ok"}

# --- Read-Only APIs (The Core Task) ---

@app.get("/tasks", response_model=List[Task])
def get_tasks(role: Optional[str] = Query(None, description="Filter tasks by assigned role (case-insensitive)")):
    """
    Get tasks.
    If 'role' is provided, returns tasks assigned to that role (case-insensitive).
    Used by Clerk/Officer dashboards.
    If no 'role' is provided, returns ALL tasks.
    Used by Admin dashboard.
    """
    if role:
        normalized_role = role.lower()
        filtered_tasks = [t for t in tasks if t.assigned_role.lower() == normalized_role]
        return filtered_tasks
    
    return tasks

@app.get("/audit-logs", response_model=List[AuditLog])
def get_audit_logs():
    """
    Get all audit logs.
    Used for audit trails.
    """
    return audit_logs

# --- IDEMPOTENCY / SIMULATION ENDPOINTS ---
# These are technically "Write" APIs, but they are needed to:
# 1. Populate the system with data so the Read APIs have something to show.
# 2. Trigger the "Audit Log Rules" (creation, status change, escalation).
# In a real microservices architecture, these might be event consumers or internal RPCs.

@app.post("/internal/tasks", response_model=Task)
def create_task(task: Task):
    # Check if task already exists
    if any(t.task_id == task.task_id for t in tasks):
        raise HTTPException(status_code=400, detail="Task ID already exists")

    tasks.append(task)
    
    # Audit Log Rule: "Task is created"
    log_audit_event(
        task_id=task.task_id, 
        action="TASK_CREATED", 
        role="SYSTEM_EXECUTION_ENGINE" # Or passed in metadata
    )
    
    return task

@app.patch("/internal/tasks/{task_id}", response_model=Task)
def update_task_status(task_id: str, update: TaskUpdate):
    task = next((t for t in tasks if t.task_id == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    old_status = task.status
    new_status = update.status
    performer_role = update.role

    # Update state
    task.status = new_status
    
    # Audit Log Rule: "Task status changes"
    if old_status != new_status:
         log_audit_event(
            task_id=task.task_id,
            action=f"STATUS_CHANGED_TO_{new_status}",
            role=performer_role
        )
         
    # Audit Log Rule: "Task is escalated" - Implicit if status becomes ESCALATED
    if new_status == "ESCALATED":
         log_audit_event(
            task_id=task.task_id,
            action="TASK_ESCALATED",
            role=performer_role
        )

    return task
