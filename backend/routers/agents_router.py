import json
import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from database import get_db
from auth import get_current_user
from schemas import AgentInfo, AgentLog

router = APIRouter(prefix="/api/agents", tags=["agents"])

AGENTS = [
    {"name": "assistant", "model": "qwen2.5:0.5b", "description": "Umumiy yordamchi agent"},
    {"name": "coder", "model": "llama3.2:1b", "description": "Dasturlash bo'yicha yordamchi"},
    {"name": "writer", "model": "tinyllama", "description": "Matn yozish bo'yicha yordamchi"},
    {"name": "thinker", "model": "phi:latest", "description": "Analitik va falsafiy agent"},
]

agent_statuses: dict[str, str] = {}
agent_logs: list[dict] = []


@router.get("", response_model=list[AgentInfo])
def list_agents(payload: dict = Depends(get_current_user)):
    result = []
    for a in AGENTS:
        status = agent_statuses.get(a["name"], "stopped")
        result.append(AgentInfo(
            name=a["name"],
            status=status,
            model=a["model"],
            description=a["description"],
        ))
    return result


@router.post("/{name}/start", response_model=dict)
def start_agent(
    name: str,
    payload: dict = Depends(get_current_user),
):
    agent = next((a for a in AGENTS if a["name"] == name), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent topilmadi")
    agent_statuses[name] = "running"
    agent_logs.append({
        "agent": name,
        "message": f"Agent {name} ishga tushirildi",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    return {"name": name, "status": "running", "message": f"Agent {name} ishga tushirildi"}


@router.post("/{name}/stop", response_model=dict)
def stop_agent(
    name: str,
    payload: dict = Depends(get_current_user),
):
    agent = next((a for a in AGENTS if a["name"] == name), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent topilmadi")
    agent_statuses[name] = "stopped"
    agent_logs.append({
        "agent": name,
        "message": f"Agent {name} to'xtatildi",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    return {"name": name, "status": "stopped", "message": f"Agent {name} to'xtatildi"}


@router.get("/logs", response_model=list[AgentLog])
def get_logs(
    limit: int = Query(50, ge=1, le=500),
    payload: dict = Depends(get_current_user),
):
    logs = agent_logs[-limit:]
    logs.reverse()
    return [AgentLog(
        agent=log["agent"],
        message=log["message"],
        timestamp=log.get("timestamp"),
    ) for log in logs]
