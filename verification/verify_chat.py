
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # --- Mock API Endpoints ---
        page.route("**/auth/verify", lambda route: route.fulfill(status=200, json={"valid": True}))
        page.route("**/auth/user", lambda route: route.fulfill(status=200, json={"user": {"id": 1, "nom": "Test User", "avatar_url": "https://i.pravatar.cc/150"}}))
        page.route("**/home/carpetes", lambda route: route.fulfill(status=200, json={"carpetes": [{"id": 1, "nom": "Test Folder", "user_id": 1}]}))
        page.route("**/carpeta/1/documents", lambda route: route.fulfill(status=200, json={"documents": [{"id": 1, "nom": "test.pdf"}]}))
        page.route("**/chat/query", lambda route: route.fulfill(status=200, json={"answer": "This document is about testing.", "sources": []}))

        # --- Run Test ---
        page.goto("http://localhost:5175/home")

        # Click on the folder
        page.get_by_text("Test Folder").click()

        # Click on the document
        page.get_by_text("test.pdf").click()

        # Ask a question
        page.get_by_placeholder("Escriu una pregunta sobre el document...").fill("What is this document about?")
        page.get_by_role("button", name="Preguntar").click()

        # Check for the AI's response and that the error is not visible
        expect(page.get_by_text("This document is about testing.")).to_be_visible()
        expect(page.get_by_text("Aquest document no te text associat")).not_to_be_visible()

        # Take a screenshot
        page.screenshot(path="verification/screenshot.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
