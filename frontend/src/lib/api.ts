import axios from 'axios';

// ========================================
// NLP BACKEND API
// ========================================

const API_BASE = "https://eighty-clubs-stop.loca.lt";

// Create client instance with the Bypass header
const client = axios.create({
    baseURL: API_BASE,
    headers: {
        'Bypass-Tunnel-Reminder': 'true' // CRITICAL for localtunnel
    }
});

export interface NLPRule {
    rule_id: string;
    conditions: string[];
    action: string;
    responsible_role: string;
    ambiguity_flag: boolean;
    ambiguity_reason: string;
}

export interface NLPResponse {
    policy_id: string;
    policy_title: string;
    rules: NLPRule[];
}

export const uploadPolicy = async (file: File, policyId: string): Promise<NLPResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('policy_id', policyId);

    const response = await client.post('/api/policy/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export interface ClarificationData {
    policy_id: string;
    rule_id: string;
    clarified_responsible_role: string;
    clarified_deadline?: string;
    clarified_conditions?: string[];
}

export const clarifyPolicy = async (clarificationData: ClarificationData) => {
    console.log('📤 Sending clarification to NLP backend:', clarificationData);

    const response = await client.post('/api/policy/clarify', clarificationData, {
        headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Clarification response:', response.data);
    return response.data;
};

// Submit policy to sync with execution backend
export const submitPolicy = async (policyId: string) => {
    console.log('📤 Submitting policy to sync with execution backend:', policyId);

    const response = await client.post('/api/policy/submit', {
        policy_id: policyId
    }, {
        headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Policy submitted and synced to execution backend:', response.data);
    return response.data;
};

// ========================================
// BACKEND EXECUTION ENGINE API
// ========================================

// Backend base URL (separate from NLP)
const BACKEND_BASE = "https://policy-execution-backend.onrender.com";

const backendClient = axios.create({
    baseURL: BACKEND_BASE,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Task interface matching backend response
export interface BackendTask {
    task_id: string;
    policy_id: string;
    rule_id: string;
    task_name?: string;
    status: 'CREATED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ESCALATED';
    assigned_role: string;  // Backend uses 'assigned_role' not 'role'
    deadline?: string;
    escalated_to?: string;
}

// Audit log interface
export interface AuditLog {
    task_id: string;
    action: string;
    role: string;
    timestamp: string;
}

// Fetch all tasks (optionally filtered by role)
export const fetchTasks = async (role?: string): Promise<BackendTask[]> => {
    console.log('📥 Fetching tasks from backend...', role ? `(role: ${role})` : '(all tasks)');

    // Don't send params at all if no role specified
    const config = role ? { params: { role } } : { params: {} };
    const response = await backendClient.get('/tasks', config);

    console.log('✅ Tasks fetched:', Array.isArray(response.data) ? response.data.length : 0);
    return Array.isArray(response.data) ? response.data : [];
};

// Update task status
export const updateTaskStatus = async (
    taskId: string,
    newStatus: string,
    role: string
): Promise<BackendTask> => {
    console.log('📤 Updating task status:', { taskId, newStatus, role });

    const response = await backendClient.post(`/tasks/${taskId}/update-status`, {
        new_status: newStatus,
        role: role
    });

    console.log('✅ Task updated:', response.data);
    return response.data;
};

// Escalate task
export const escalateTask = async (taskId: string, role: string): Promise<BackendTask> => {
    console.log('📤 Escalating task:', { taskId, role });

    const response = await backendClient.post(`/tasks/${taskId}/escalate`, {
        role: role
    });

    console.log('✅ Task escalated:', response.data);
    return response.data;
};

// Fetch audit logs
export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
    console.log('📥 Fetching audit logs from backend...');

    try {
        const response = await backendClient.get('/audit-logs');
        console.log('✅ Audit logs fetched:', response.data.length);
        return response.data;
    } catch (error) {
        console.warn('⚠️ Audit logs endpoint not available, returning empty array');
        return [];
    }
};

// Activity event interface
export interface ActivityEvent {
    id: string;
    type: 'upload' | 'processing' | 'ambiguity' | 'export' | 'approval';
    title: string;
    description: string;
    timestamp: string;
    user: string;
    status: 'completed' | 'processing' | 'failed';
}

// Fetch recent activity
export const fetchRecentActivity = async (): Promise<ActivityEvent[]> => {
    console.log('📥 Fetching recent activity from backend...');

    try {
        const response = await backendClient.get('/activity/recent');
        console.log('✅ Recent activity fetched:', response.data.length);
        return response.data;
    } catch (error) {
        console.warn('⚠️ Recent activity endpoint not available, returning empty array');
        return [];
    }
};

// Fetch policy statistics (if endpoint exists)
export const fetchPolicyStats = async () => {
    console.log('📥 Fetching policy statistics from backend...');

    try {
        const response = await backendClient.get('/policies/stats');
        console.log('✅ Policy stats fetched:', response.data);
        return response.data;
    } catch (error) {
        console.warn('⚠️ Policy stats endpoint not available, returning default');
        return { total: 0, active: 0 };
    }
};

// ========================================
// NLP RESULTS & PDF EXPORT API
// ========================================

// NLP Result interface
export interface NLPResult {
    result_id: string;
    policy_id: string;
    file_name: string;
    upload_timestamp: string;
    status: string;
    nlp_data?: any;
}

// Save NLP results to backend
export const saveNLPResults = async (policyId: string, fileName: string, nlpData: any): Promise<string> => {
    console.log('📤 Saving NLP results to backend...', { policyId, fileName });

    try {
        const response = await backendClient.post('/nlp-results/save', {
            policy_id: policyId,
            file_name: fileName,
            nlp_data: nlpData
        });

        console.log('✅ NLP results saved:', response.data.result_id);
        return response.data.result_id;
    } catch (error) {
        console.error('❌ Error saving NLP results:', error);
        throw error;
    }
};

// Fetch all NLP results
export const fetchNLPResults = async (): Promise<NLPResult[]> => {
    console.log('📥 Fetching NLP results from backend...');

    try {
        const response = await backendClient.get('/nlp-results');
        console.log('✅ NLP results fetched:', response.data.length);
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching NLP results:', error);
        return [];
    }
};

// Fetch specific NLP result
export const fetchNLPResult = async (resultId: string): Promise<NLPResult | null> => {
    console.log('📥 Fetching NLP result:', resultId);

    try {
        const response = await backendClient.get(`/nlp-results/${resultId}`);
        console.log('✅ NLP result fetched');
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching NLP result:', error);
        return null;
    }
};

// Download PDF for NLP result
export const downloadNLPResultPDF = async (resultId: string, fileName?: string): Promise<void> => {
    console.log('📥 Downloading PDF for result:', resultId);

    try {
        const response = await backendClient.get(`/nlp-results/${resultId}/download-pdf`, {
            responseType: 'blob'
        });

        // Create blob URL and trigger download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || `policy_${resultId}.pdf`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log('✅ PDF downloaded successfully');
    } catch (error) {
        console.error('❌ Error downloading PDF:', error);
        throw error;
    }
};

export default client;
