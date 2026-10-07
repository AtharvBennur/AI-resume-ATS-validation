"""Project-wide smoke test runner.

Run from the repository root:
    python testing/run_tests.py

The suite intentionally uses only Python's standard library so it can run
before any optional Python test dependencies are installed.
"""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
import time
import unittest
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"
BACKEND = ROOT / "backend"
APP_FILE = FRONTEND / "src" / "App.jsx"
FRONTEND_URL = "http://127.0.0.1:4173"
NPM = shutil.which("npm.cmd") or shutil.which("npm") or "npm"


def run_command(command: list[str], cwd: Path, timeout: int = 180) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        cwd=cwd,
        text=True,
        capture_output=True,
        timeout=timeout,
        check=False,
    )


def wait_for_url(url: str, process: subprocess.Popen[str], timeout: float = 30) -> None:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if process.poll() is not None:
            output = process.stdout.read() if process.stdout else ""
            raise AssertionError(f"Server exited early with code {process.returncode}: {output}")
        try:
            with urlopen(url, timeout=2):
                return
        except (URLError, TimeoutError):
            time.sleep(0.25)
    raise AssertionError(f"Server did not become ready: {url}")


def declared_routes() -> list[str]:
    source = APP_FILE.read_text(encoding="utf-8")
    return re.findall(r'<Route path="([^"]+)"', source)


class ProjectTests(unittest.TestCase):
    def test_backend_structure_matches_requested_layout(self) -> None:
        expected = [
            "config",
            "controllers",
            "middleware",
            "models",
            "routes",
            ".env.example",
            ".gitignore",
            "package.json",
            "server.js",
        ]
        missing = [item for item in expected if not (BACKEND / item).exists()]
        self.assertFalse(missing, f"Missing backend items: {missing}")

    def test_all_declared_routes_are_covered(self) -> None:
        routes = declared_routes()
        expected = {
            "/", "/login", "/register", "/dashboard", "/resume/create",
            "/resume/:id/edit", "/resume/:id/preview", "/resume/update",
            "/resume/enhance", "/ats", "/ats/:id", "/resumes", "/profile",
            "/settings", "*",
        }
        self.assertEqual(set(routes), expected)
        self.assertEqual(len(routes), len(expected))

    def test_every_page_module_exists(self) -> None:
        page_names = {
            "Home", "Login", "Register", "Dashboard", "CreateResume",
            "UpdateResume", "EnhanceResume", "ATSValidation", "ATSReport",
            "Resumes", "Profile", "Settings", "NotFound",
        }
        missing = [
            name for name in page_names
            if not (FRONTEND / "src" / "pages" / f"{name}.jsx").exists()
        ]
        self.assertFalse(missing, f"Missing page modules: {missing}")

    def test_auth_guard_and_login_integration_are_present(self) -> None:
        app_source = APP_FILE.read_text(encoding="utf-8")
        login_source = (FRONTEND / "src" / "pages" / "Login.jsx").read_text(encoding="utf-8")
        guard_source = (FRONTEND / "src" / "components" / "ProtectedRoute.jsx").read_text(encoding="utf-8")
        api_source = (FRONTEND / "src" / "services" / "api.js").read_text(encoding="utf-8")

        self.assertIn("localStorage.getItem('authToken')", app_source)
        self.assertIn("<Navigate to=\"/login\"", guard_source)
        self.assertIn("loginUser(", login_source)
        self.assertIn("request('/auth/login'", api_source)

    def test_frontend_lint_and_build(self) -> None:
        lint = run_command([NPM, "run", "lint"], FRONTEND)
        self.assertEqual(lint.returncode, 0, lint.stdout + lint.stderr)
        build = run_command([NPM, "run", "build"], FRONTEND)
        self.assertEqual(build.returncode, 0, build.stdout + build.stderr)

    def test_backend_tests(self) -> None:
        result = run_command([NPM, "test"], BACKEND)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_every_declared_page_returns_from_vite(self) -> None:
        process = subprocess.Popen(
            [NPM, "run", "dev", "--", "--host", "127.0.0.1", "--port", "4173"],
            cwd=FRONTEND,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )
        try:
            wait_for_url(FRONTEND_URL, process)
            route_examples = {
                "/resume/:id/edit": "/resume/1/edit",
                "/resume/:id/preview": "/resume/1/preview",
                "/ats/:id": "/ats/1",
                "*": "/missing-page",
            }
            for route in declared_routes():
                route_to_check = route_examples.get(route, route)
                with self.subTest(route=route):
                    response = urlopen(Request(FRONTEND_URL + route_to_check, method="GET"), timeout=5)
                    self.assertEqual(response.status, 200)
                    self.assertIn("<div id=\"root\"></div>", response.read().decode("utf-8"))
        finally:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
            if process.stdout:
                process.stdout.close()


if __name__ == "__main__":
    result = unittest.main(verbosity=2, exit=False)
    sys.exit(0 if result.result.wasSuccessful() else 1)
