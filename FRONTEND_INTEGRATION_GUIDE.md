# Frontend Integration Guide for Policy AI Engine

## 🌍 Connect from Anywhere (Tunneling)
Since the frontend is on a different machine, we are using a **Public Tunnel** to expose your local backend.

### ✅ Live Public URL
Use this URL in your frontend configuration:
```
https://policy-ai-demo.loca.lt
```

### ⚠️ Important: Bypass Warning Page
When the frontend first connects, `localtunnel` might show a "Friendly Reminder" warning page asking for an IP.
**To bypass this in your API calls, you MUST add this header to all requests:**
```javascript
"Bypass-Tunnel-Reminder": "true"
```

---

## 🚀 API Endpoints

### 1️⃣ Upload & Process Policy
**Endpoint:** `POST /api/policy/process`  
**URL:** `https://policy-ai-demo.loca.lt/api/policy/process`
**Content-Type:** `multipart/form-data`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | `File` | ✅ | The PDF policy document |
| `policy_id` | `string` | ✅ | Client-generated unique ID (e.g., "POL_123") |

#### ✅ Success Response (JSON)
```json
{
  "policy_id": "POL_123",
  "policy_title": "Student Scholarship Scheme",
  "rules": [
    {
      "rule_id": "R1",
      "conditions": ["Income < 2L"],
      "action": "Pay ₹10,000",
      "responsible_role": "District Officer",
      "ambiguity_flag": false,
      "ambiguity_reason": ""
    }
  ]
}
```

---

### 2️⃣ Clarify Ambiguity
**Endpoint:** `POST /api/policy/clarify`  
**URL:** `https://policy-ai-demo.loca.lt/api/policy/clarify`
**Content-Type:** `application/json`

#### Request Example
```json
{
  "policy_id": "POL_123",
  "rule_id": "R2",
  "clarified_responsible_role": "Headmaster"
}
```

---

## 💻 Code Example (React + Axios)

### Adjusted for Tunneling
```javascript
import axios from 'axios';

const API_BASE = "https://policy-ai-demo.loca.lt";

// Create client instance with the Bypass header
const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Bypass-Tunnel-Reminder': 'true' // CRITICAL for localtunnel
  }
});

export const uploadPolicy = async (file, policyId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('policy_id', policyId);

  const response = await client.post('/api/policy/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const solveAmbiguity = async (policyId, ruleId, roleInput) => {
  const payload = {
    policy_id: policyId,
    rule_id: ruleId,
    clarified_responsible_role: roleInput
  };

  const response = await client.post('/api/policy/clarify', payload);
  return response.data;
};
```

---

## 🔧 backend Setup (Reference)
If the backend stops, restart it with:
1. **Start Server**: `python main.py`
2. **Start Tunnel**: `npx localtunnel --port 8000 --subdomain policy-ai-demo`
