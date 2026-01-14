// executionFlow.js
// Defines the allowed execution states and transitions

const STATES = {
  CREATED: "CREATED",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  ESCALATED: "ESCALATED"
};

const TRANSITIONS = {
  CREATED: [STATES.ASSIGNED],
  ASSIGNED: [STATES.IN_PROGRESS],
  IN_PROGRESS: [STATES.COMPLETED, STATES.ESCALATED],
  ESCALATED: [STATES.ASSIGNED],
  COMPLETED: []
};

function isValidTransition(currentState, nextState) {
  return TRANSITIONS[currentState]?.includes(nextState);
}

module.exports = {
  STATES,
  TRANSITIONS,
  isValidTransition
};
