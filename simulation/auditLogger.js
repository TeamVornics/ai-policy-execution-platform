// auditLogger.js
// Handles immutable audit logging

const auditLogs = [];

function logAction(taskId, action, role) {
  const logEntry = {
    task_id: taskId,
    action: action,
    performed_by_role: role,
    timestamp: new Date().toISOString()
  };

  auditLogs.push(logEntry);
  console.log("AUDIT LOG:", logEntry);
}

function getAuditLogs() {
  return auditLogs;
}

module.exports = {
  logAction,
  getAuditLogs
};
