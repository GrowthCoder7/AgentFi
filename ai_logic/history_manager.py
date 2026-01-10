import json
import os
from datetime import datetime

DB_FILE = "../frontend/public/agent_history.json"

def init_db():
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, 'w') as f:
            json.dump({"trades": [], "logs": []}, f)

def build_decision_graph(rationale_steps, decision_id):
    """
    Converts a list of steps into React Flow nodes/edges.
    steps = [
        ("Start Analysis", "neutral"),
        ("RSI is 25 (Oversold)", "pass"),
        ("Sentiment is Positive", "pass"),
        ("Gas Price < 30 Gwei", "pass"),
        ("EXECUTE BUY", "success")
    ]
    """
    nodes = []
    edges = []
    
    for i, (label, status) in enumerate(rationale_steps):
        # Determine color based on status
        bg_color = "#1f2937" # default dark
        if status == "pass": bg_color = "#1e40af" # blue
        if status == "fail": bg_color = "#991b1b" # red
        if status == "success": bg_color = "#065f46" # green

        node_id = f"{decision_id}-{i}"
        
        nodes.append({
            "id": node_id,
            "data": { "label": label },
            "position": { "x": 100, "y": i * 100 }, # Stack vertically
            "style": { 
                "background": bg_color, 
                "color": "#fff", 
                "border": "1px solid #374151", 
                "borderRadius": "8px",
                "padding": "10px",
                "fontSize": "12px",
                "width": "200px"
            }
        })

        # Connect to previous node
        if i > 0:
            edges.append({
                "id": f"e-{decision_id}-{i}",
                "source": f"{decision_id}-{i-1}",
                "target": node_id,
                "animated": True,
                "style": { "stroke": "#4b5563" }
            })
            
    return {"nodes": nodes, "edges": edges}

def log_trade_decision(coin, action, price, steps):
    init_db()
    with open(DB_FILE, 'r') as f:
        data = json.load(f)

    decision_id = f"trade-{len(data['trades']) + 1}"
    
    # Build the computational graph for this specific trade
    graph_data = build_decision_graph(steps, decision_id)

    record = {
        "id": decision_id,
        "timestamp": datetime.now().isoformat(),
        "coin": coin,
        "action": action,
        "price": price,
        "graph": graph_data # <--- The visual tree data
    }

    data["trades"].append(record)

    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=4)
    
    print(f"✅ Decision Graph Generated for {coin}")

# TEST: Run this file directly to generate a sample graph
if __name__ == "__main__":
    sample_steps = [
        ("🔍 Start Market Scan", "neutral"),
        ("📊 Check RSI Indicator", "pass"),
        ("🐦 Analyze Twitter Sentiment", "pass"),
        ("⛽ Check Gas Fees", "pass"),
        ("✅ EXECUTE BUY ORDER", "success")
    ]
    log_trade_decision("ETH", "BUY", 3150.00, sample_steps)