"""
Timeline Estimator Module
Estimates policy execution duration, critical path, and generates Gantt charts.
"""

import re
import math
from typing import List, Dict, Any, Tuple

class TimelineEstimator:
    """
    Analyzes policy rules to estimate execution timeline and dependencies.
    """
    
    def generate_execution_timeline(self, rules: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate a complete execution timeline with critical path analysis.
        """
        # 1. Detect Dependencies
        dependencies = self.detect_dependencies(rules)
        
        # 2. Parse Deadlines/Durations for each rule
        durations = {
            rule['rule_id']: self.parse_deadline(str(rule.get('deadline', ''))) 
            for rule in rules
        }
        
        # 3. Calculate Start/End Times
        timeline = []
        rule_map = {r['rule_id']: r for r in rules}
        
        # Simple topological calculations (assuming DAG)
        # Initialize start times to 0
        start_times = {rid: 0 for rid in rule_map.keys()}
        end_times = {rid: dur for rid, dur in durations.items()}
        
        # Iterate to propagate delays (simple method)
        # Should be sufficient for policy chains which are usually short
        changed = True
        while changed:
            changed = False
            for rule_id, deps in dependencies.items():
                if not deps:
                    continue
                    
                # Start day is max(end_day of all dependencies)
                max_dep_end = 0
                for dep_id in deps:
                    # Find dependency in current calculated end_times
                    if dep_id in end_times:
                        max_dep_end = max(max_dep_end, end_times[dep_id])
                
                current_start = start_times.get(rule_id, 0)
                if max_dep_end > current_start:
                    start_times[rule_id] = max_dep_end
                    end_times[rule_id] = start_times[rule_id] + durations.get(rule_id, 0)
                    changed = True

        # Build timeline object
        for rule in rules:
            rid = rule['rule_id']
            timeline.append({
                "rule_id": rid,
                "task": rule.get('action', 'Unknown Task'),
                "responsible_role": rule.get('responsible_role', 'Unknown Role'),
                "start_day": start_times.get(rid, 0),
                "end_day": end_times.get(rid, 0),
                "duration": durations.get(rid, 0),
                "dependencies": dependencies.get(rid, [])
            })
            
        # 4. Critical Path Analysis
        # Path with the longest total duration
        total_estimated_days = max(end_times.values()) if end_times else 0
        critical_path = self._find_critical_path(timeline, total_estimated_days)
        
        return {
            "total_estimated_days": total_estimated_days,
            "critical_path": critical_path,
            "timeline": sorted(timeline, key=lambda x: x['start_day']),
            "bottlenecks": self._detect_bottlenecks(rules),
            "warnings": self._generate_warnings(timeline)
        }

    def parse_deadline(self, deadline_str: str) -> int:
        """Parse deadline string into number of days."""
        text = deadline_str.lower().strip()
        if not text:
            return 5  # Default assumption for task duration
            
        # Direct parsing
        if "immediate" in text or "instantly" in text:
            return 0
        
        # Regex extraction
        # "15 days", "1 month", "2 weeks"
        match = re.search(r'(\d+)\s*(day|week|month|year)', text)
        if match:
            value = int(match.group(1))
            unit = match.group(2)
            
            if "day" in unit:
                return value
            elif "week" in unit:
                return value * 7
            elif "month" in unit:
                return value * 30
            elif "year" in unit:
                return value * 365
                
        # Handle "within a week" etc.
        if "week" in text:
            return 7
        if "month" in text:
            return 30
            
        return 7 # Fallback average processing time

    def detect_dependencies(self, rules: List[Dict[str, Any]]) -> Dict[str, List[str]]:
        """
        Auto-detect rule dependencies based on logic patterns.
        Returns {rule_id: [dependency_ids]}
        """
        deps = {r['rule_id']: [] for r in rules}
        
        for i, rule in enumerate(rules):
            current_id = rule['rule_id']
            conditions = " ".join(rule.get('conditions', []) or []).lower()
            action = rule.get('action', '').lower()
            
            # Heuristic 1: Explicit sequence implied by order (Optional, strictly usually policies are state-based)
            # We stick to content-based detection first
            
            # Heuristic 2: "After verification" -> depends on rule with "verification" action
            if "after verification" in action or "after verification" in conditions:
                # Find rule doing verification
                for prev_rule in rules:
                    if prev_rule['rule_id'] == current_id:
                        continue
                    if "verif" in prev_rule.get('action', '').lower():
                        deps[current_id].append(prev_rule['rule_id'])
                        
            # Heuristic 3: Output-Input dependency (e.g. requires "certificate" produced by another?)
            # Simplified for demo: Strict sequential assumption if unlinked? 
            # No, let's assume parallel unless linked.
            
            # Heuristic 4: Fallback for Demo Data Structure 
            # Ensure R1 -> R2 flow if "verification" -> "scholarship"
            if "scholarship" in action and "verif" not in action:
                # This depends on verification if it exists
                for prev_rule in rules:
                    if "verif" in prev_rule.get('action', '').lower():
                         if prev_rule['rule_id'] not in deps[current_id]:
                             deps[current_id].append(prev_rule['rule_id'])
                             
        return deps

    def visualize_timeline(self, timeline_data: Dict[str, Any]) -> str:
        """Generate ASCII Gantt Chart."""
        timeline = timeline_data['timeline']
        total_days = timeline_data['total_estimated_days']
        
        if total_days == 0:
            return "No timeline data available."
            
        # Scale for display (max 50 chars width)
        scale = 50 / max(total_days, 1)
        
        output = []
        output.append("Rule ID | Timeline (Days)")
        header_ruler = " " * 8 + "0" + "-" * (int(total_days * scale)) + str(total_days)
        output.append(header_ruler)
        
        for item in timeline:
            start = int(item['start_day'] * scale)
            duration = max(1, int(item['duration'] * scale))
            
            bar = " " * start + "[" + "█" * duration + "]"
            label = f"{item['rule_id']:<8}|{bar} ({item['duration']}d)"
            output.append(label)
            
        output.append("-" * 60)
        output.append(f"Total Duration: {total_days} days")
        output.append(f"Critical Path: {' -> '.join(timeline_data['critical_path'])}")
        
        return "\n".join(output)

    def _find_critical_path(self, timeline: List[Dict[str, Any]], total_days: int) -> List[str]:
        """Backtrack to find critical path."""
        # Find ending node
        path = []
        current_node = None
        
        # Start with node that finishes last
        candidates = [t for t in timeline if t['end_day'] == total_days]
        if not candidates:
            return []
            
        current_node = candidates[0]
        path.append(current_node['rule_id'])
        
        while True:
            deps = current_node['dependencies']
            if not deps:
                break
                
            # Find the dependency that pushed this start time (critical dependency)
            # i.e., end_day matches current start_day
            crit_dep = None
            for t in timeline:
                if t['rule_id'] in deps and t['end_day'] == current_node['start_day']:
                    crit_dep = t
                    break
            
            if crit_dep:
                current_node = crit_dep
                path.append(current_node['rule_id'])
            else:
                break
                
        return list(reversed(path))

    def _detect_bottlenecks(self, rules: List[Dict[str, Any]]) -> List[str]:
        """Identify roles with excessive responsibilities."""
        role_counts = {}
        for r in rules:
            role = r.get('responsible_role', 'Unknown')
            if role:
                role_counts[role] = role_counts.get(role, 0) + 1
        
        bottlenecks = []
        for role, count in role_counts.items():
            if count > 2: # Threshold for demo
                bottlenecks.append(f"Role '{role}' is a bottleneck ({count} tasks). Suggest parallelization.")
        return bottlenecks
        
    def _generate_warnings(self, timeline: List[Dict[str, Any]]) -> List[str]:
        """Generate timeline warnings."""
        warnings = []
        for t in timeline:
            if t['duration'] > 60:
                warnings.append(f"Rule {t['rule_id']} has a very long duration ({t['duration']} days).")
            if t['duration'] == 0:
                warnings.append(f"Rule {t['rule_id']} has 'immediate' execution. Ensure feasible.")
        return warnings
