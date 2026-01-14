# Execution Monitoring & Audit Logging Backend

This is the backend service for the Execution Monitoring layer (Member 4).

## Features
- **Task Management**: Read-only APIs for tasks filtered by role.
- **Audit Logging**: Immutable, append-only logs for all task execution events.
- **Simulation**: Internal endpoints to simulate task creation and status updates.

## Setup

1.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Run Server**
    ```bash
    uvicorn main:app --reload --port 8000
    ```

## API Endpoints

-   `GET /health`: Health check.
-   `GET /tasks`: Get all tasks (Admin).
-   `GET /tasks?role={ROLE}`: Get tasks for a specific role (Clerk, Officer).
-   `GET /audit-logs`: Get audit trail.

## Simulation (For Testing)

To populate data:
-   `POST /internal/tasks`: Create tasks.
-   `PATCH /internal/tasks/{task_id}`: Update task status.
