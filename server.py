from __future__ import annotations

import json
import os
import uuid
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
SUBMISSIONS_FILE = DATA_DIR / "submissions.json"
ADMIN_KEY = os.environ.get("ADMIN_KEY", "solo-io")
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "8000"))

STATIC_FILES = {
    "/": ("index.html", "text/html; charset=utf-8"),
    "/index.html": ("index.html", "text/html; charset=utf-8"),
    "/admin": ("admin.html", "text/html; charset=utf-8"),
    "/admin.html": ("admin.html", "text/html; charset=utf-8"),
    "/style.css": ("style.css", "text/css; charset=utf-8"),
    "/styles.css": ("styles.css", "text/css; charset=utf-8"),
    "/script.js": ("script.js", "application/javascript; charset=utf-8"),
    "/upload.js": ("upload.js", "application/javascript; charset=utf-8"),
    "/admin.js": ("admin.js", "application/javascript; charset=utf-8"),
}


def ensure_storage() -> None:
    DATA_DIR.mkdir(exist_ok=True)

    if not SUBMISSIONS_FILE.exists():
        SUBMISSIONS_FILE.write_text("[]", encoding="utf-8")


def load_submissions() -> list[dict]:
    ensure_storage()
    return json.loads(SUBMISSIONS_FILE.read_text(encoding="utf-8"))


def save_submissions(submissions: list[dict]) -> None:
    SUBMISSIONS_FILE.write_text(
        json.dumps(submissions, ensure_ascii=True, indent=2),
        encoding="utf-8",
    )


class AppHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        parsed = urlparse(self.path)

        if parsed.path == "/api/submissions":
            self.handle_list_submissions(parsed)
            return

        if parsed.path in {"/admin", "/admin.html"}:
            self.serve_admin_page(parsed)
            return

        if parsed.path in STATIC_FILES:
            self.serve_static(parsed.path)
            return

        self.send_error(HTTPStatus.NOT_FOUND, "Page not found")

    def do_POST(self) -> None:
        parsed = urlparse(self.path)

        if parsed.path == "/api/submissions":
            self.handle_create_submission()
            return

        self.send_error(HTTPStatus.NOT_FOUND, "Endpoint not found")

    def serve_static(self, path: str) -> None:
        filename, content_type = STATIC_FILES[path]
        file_path = BASE_DIR / filename

        if not file_path.exists():
            self.send_error(HTTPStatus.NOT_FOUND, "File not found")
            return

        payload = file_path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def serve_admin_page(self, parsed) -> None:
        params = parse_qs(parsed.query)

        if params.get("key", [""])[0] != ADMIN_KEY:
            self.send_response(HTTPStatus.FORBIDDEN)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"Admin access denied")
            return

        self.serve_static("/admin.html")

    def handle_create_submission(self) -> None:
        content_length = int(self.headers.get("Content-Length", "0"))

        if not content_length:
            self.send_json({"error": "Empty request"}, HTTPStatus.BAD_REQUEST)
            return

        raw_body = self.rfile.read(content_length)

        try:
            payload = json.loads(raw_body)
            weekly_average_minutes = int(payload.get("weeklyAverageMinutes", 0))
            weekly_average_hours = int(payload.get("weeklyAverageHours", 0))
            weekly_average_remainder_minutes = int(payload.get("weeklyAverageRemainderMinutes", 0))
            top_apps = payload.get("topApps", [])
            pickups_count = int(payload.get("pickupsCount", 0))
            notifications_count = int(payload.get("notificationsCount", 0))
        except (json.JSONDecodeError, ValueError, TypeError):
            self.send_json({"error": "Invalid payload"}, HTTPStatus.BAD_REQUEST)
            return

        cleaned_top_apps = []

        for app in top_apps[:3]:
            label = str(app).strip()[:60]

            if label:
                cleaned_top_apps.append(label)

        if (
            weekly_average_hours < 0
            or weekly_average_remainder_minutes < 0
            or weekly_average_remainder_minutes > 59
            or weekly_average_minutes <= 0
            or len(cleaned_top_apps) != 3
        ):
            self.send_json({"error": "Incomplete data"}, HTTPStatus.BAD_REQUEST)
            return

        if pickups_count < 0 or notifications_count < 0:
            self.send_json({"error": "Invalid numbers"}, HTTPStatus.BAD_REQUEST)
            return

        submissions = load_submissions()
        submission = {
            "id": uuid.uuid4().hex,
            "weeklyAverageMinutes": weekly_average_minutes,
            "weeklyAverageHours": weekly_average_hours,
            "weeklyAverageRemainderMinutes": weekly_average_remainder_minutes,
            "weeklyAverageLabel": f"{weekly_average_hours}h {weekly_average_remainder_minutes}m",
            "topApps": cleaned_top_apps,
            "pickupsCount": pickups_count,
            "notificationsCount": notifications_count,
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
        submissions.append(submission)
        save_submissions(submissions)

        self.send_json({"ok": True, "submission": submission}, HTTPStatus.CREATED)

    def handle_list_submissions(self, parsed) -> None:
        params = parse_qs(parsed.query)

        if params.get("key", [""])[0] != ADMIN_KEY:
            self.send_json({"error": "Unauthorized access"}, HTTPStatus.FORBIDDEN)
            return

        submissions = list(reversed(load_submissions()))
        self.send_json({"submissions": submissions}, HTTPStatus.OK)

    def send_json(self, payload: dict, status: int) -> None:
        body = json.dumps(payload, ensure_ascii=True).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    ensure_storage()
    server = ThreadingHTTPServer((HOST, PORT), AppHandler)
    print(f"Server attivo su http://127.0.0.1:{PORT}")
    print(f"Dashboard admin: http://127.0.0.1:{PORT}/admin?key={ADMIN_KEY}")
    server.serve_forever()
