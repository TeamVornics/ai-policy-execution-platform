
// demoTest.js
// End-to-end demo simulation

const task = require("./mockBackendInput.json");
const { simulateTaskExecution } = require("./simulationEngine");
const { getAuditLogs } = require("./auditLogger");

console.log("=== POLICY EXECUTION SIMULATION START ===");

// Toggle delay simulation here (true = escalation demo)
simulateTaskExecution(task, false);

console.log("\nOfficer can now view updated task");
console.log("Admin can view audit trail");

console.log("\n=== FINAL AUDIT LOGS ===");
console.table(getAuditLogs());

console.log("\n=== SIMULATION END ===");
