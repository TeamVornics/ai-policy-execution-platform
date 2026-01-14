"""
Workflow visualization module using Graphviz and D3.js fallback.
Generates flowcharts from policy rules.
"""

import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import graphviz

class WorkflowVisualizer:
    """
    Generates executable workflow visualizations from policy rules.
    Prioritizes interactive HTML output for compatibility.
    """
    
    def __init__(self):
        self.output_formats = ['dot', 'html', 'png']

    def generate_graph(self, rules: List[Dict[str, Any]], title: str = "Policy Workflow") -> graphviz.Digraph:
        """
        Convert rules into a Graphviz Digraph.
        
        Structure:
        START -> [Decision: Conditions] -> [Action] -> [Next Trigger/Stop]
        """
        dot = graphviz.Digraph(comment=title)
        dot.attr(rankdir='TB', size='10')
        
        # Graph Attributes
        dot.attr('node', shape='rect', style='rounded,filled', 
                 fontname='Helvetica', fontsize='10')
        dot.attr('edge', fontname='Helvetica', fontsize='9')
        
        # Start Node
        dot.node('START', 'Start Policy Check', shape='circle', 
                 style='filled', fillcolor='#333333', fontcolor='white', width='0.8')
        
        previous_node = 'START'
        
        for i, rule in enumerate(rules):
            rid = rule.get('rule_id', f'R{i+1}')
            action = rule.get('action', 'Unknown Action')
            role = rule.get('responsible_role', 'Unknown Role')
            conditions = rule.get('conditions', [])
            is_ambiguous = rule.get('ambiguity_flag', False)
            
            # Color coding
            fill_color = '#ffeeee' if is_ambiguous else '#e8f5e9'  # Red tint if ambiguous, Green tint if clear
            border_color = '#d32f2f' if is_ambiguous else '#2e7d32'
            
            # 1. Condition Node (Diamond)
            cond_node_id = f'{rid}_COND'
            cond_label = "Conditions Met?"
            if conditions:
                cond_list = "\\n".join([f"- {c}" for c in conditions[:3]]) # Limit to 3 for display
                cond_label = f"CHECK:\\n{cond_list}"
                
            dot.node(cond_node_id, cond_label, shape='diamond', 
                     style='filled', fillcolor='#fff3e0', color='#f57c00')
            
            # Link previous to condition
            dot.edge(previous_node, cond_node_id)
            
            # 2. Action Node (Rectangle)
            action_node_id = f'{rid}_ACT'
            
            # Prepare formatted label
            label_html = f'''<<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0">
              <TR><TD><B>{rid}</B></TD></TR>
              <TR><TD>{action}</TD></TR>
              <TR><TD><I>By: {role}</I></TD></TR>
            </TABLE>>'''
            
            dot.node(action_node_id, label_html, shape='note', 
                     style='filled', fillcolor=fill_color, color=border_color)
            
            # Link Condition -> Action (YES path)
            dot.edge(cond_node_id, action_node_id, label='Yes')
            
            # Link Condition -> Next Rule (NO path - simplified flow)
            # Logic: If conditions fail, check next rule. If no next rule, end.
            next_node = f'R{i+2}_COND' if i < len(rules) - 1 else 'END'
            dot.edge(cond_node_id, next_node, label='No', style='dashed', color='#999999')
            
            previous_node = action_node_id
            
        # End Node
        dot.node('END', 'End Process', shape='doublecircle', 
                 style='filled', fillcolor='#333333', fontcolor='white')
        
        dot.edge(previous_node, 'END')
        
        return dot

    def save_visualization(self, graph: graphviz.Digraph, output_dir: str = "demo_data", filename: str = "workflow") -> Dict[str, str]:
        """
        Save the graph in multiple formats.
        Returns dictionary of saved paths using absolute paths.
        """
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        base_name = output_path / filename
        
        saved_files = {}
        
        # 1. Save DOT source (Always works)
        try:
            dot_path = base_name.with_suffix('.dot')
            with open(dot_path, 'w') as f:
                f.write(graph.source)
            saved_files['dot'] = str(dot_path.absolute())
        except Exception as e:
            print(f"⚠️ Failed to save DOT file: {e}")

        # 2. Generate Interactive HTML (D3-Graphviz) - Robust Fallback
        try:
            html_path = base_name.with_suffix('.html')
            self._save_html_viewer(graph.source, html_path)
            saved_files['html'] = str(html_path.absolute())
        except Exception as e:
            print(f"⚠️ Failed to save HTML file: {e}")

        # 3. Attempt PNG Rendering (May fail without system binary)
        try:
            # graphviz.render() calls the 'dot' binary
            png_path = graph.render(filename=filename, directory=output_dir, format='png', cleanup=False)
            saved_files['png'] = str(Path(png_path).absolute())
        except graphviz.backend.ExecutableNotFound:
            print(f"\n⚠️  Graphviz binary 'dot' not found on system.")
            print(f"    skipped PNG generation.")
            print(f"    ✅ Interactive HTML version is ready instead: {saved_files.get('html')}")
        except Exception as e:
             print(f"⚠️ Failed to render PNG: {e}")

        return saved_files

    def _save_html_viewer(self, dot_source: str, output_path: Path):
        """
        Embeds the DOT source into a standalone HTML file using d3-graphviz CDN.
        This provides a high-quality interactive viewer without any local dependencies.
        """
        # Clean dot source for JS string injection
        clean_dot = dot_source.replace('\n', '\\n').replace('"', '\\"')
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Policy Workflow Visualizer</title>
    <style>
        body {{ margin: 0; padding: 20px; font-family: sans-serif; background: #f8f9fa; }}
        #graph {{ width: 100%; height: 90vh; border: 1px solid #ddd; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }}
        h1 {{ margin: 0; color: #333; }}
        .badge {{ padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; }}
        .badge-html {{ background: #e3f2fd; color: #1565c0; border: 1px solid #90caf9; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Policy Execution Workflow</h1>
        <span class="badge badge-html">Interactive Web View</span>
    </div>
    <div id="graph" style="text-align: center;"></div>
    
    <!-- Dependencies -->
    <script src="https://d3js.org/d3.v5.min.js"></script>
    <script src="https://unpkg.com/@hpcc-js/wasm@0.3.11/dist/index.min.js"></script>
    <script src="https://unpkg.com/d3-graphviz@3.0.5/build/d3-graphviz.js"></script>
    
    <script>
        const dotSource = "{clean_dot}";
        
        d3.select("#graph").graphviz()
            .width(window.innerWidth - 60)
            .height(window.innerHeight - 100)
            .fit(true)
            .renderDot(dotSource);
    </script>
</body>
</html>
"""
        with open(output_path, 'w') as f:
            f.write(html_content)
