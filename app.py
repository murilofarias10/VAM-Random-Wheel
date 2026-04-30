"""
VAM-AI Random Wheel Generator
Run with: python app.py
"""

from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__, template_folder="templates", static_folder="static")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/events/<path:filename>")
def serve_event_image(filename):
    events_dir = os.path.join(os.path.dirname(__file__), "events")
    return send_from_directory(events_dir, filename)


@app.route("/logo")
def serve_logo():
    base_dir = os.path.dirname(__file__)
    return send_from_directory(base_dir, "vam-ai-logo.png")


@app.route("/api/events")
def list_events():
    """Return list of event images."""
    events_dir = os.path.join(os.path.dirname(__file__), "events")
    images = []
    allowed = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
    for f in sorted(os.listdir(events_dir)):
        ext = os.path.splitext(f)[1].lower()
        if ext in allowed:
            images.append(f"/events/{f}")
    from flask import jsonify
    return jsonify(images)


if __name__ == "__main__":
    print("=" * 60)
    print("  VAM-AI Random Wheel Generator")
    print("  Open your browser at: http://127.0.0.1:5000")
    print("=" * 60)
    app.run(debug=True, port=5000)
