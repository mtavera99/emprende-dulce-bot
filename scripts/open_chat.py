import subprocess
import json
import time

def run_js(js_code):
    as_script = f'''
tell application "Google Chrome"
    tell tab 8 of window 1
        execute javascript {json.dumps(js_code)}
    end tell
end tell
'''
    res = subprocess.run(["osascript", "-e", as_script], capture_output=True, text=True)
    if res.returncode != 0:
        print("AppleScript Error:", res.stderr)
        return None
    return res.stdout.strip()

if __name__ == "__main__":
    click_js = """
    (() => {
        const titleSpan = document.querySelector('span[title="Hijo Amado"]') || 
                          Array.from(document.querySelectorAll('span')).find(s => s.getAttribute('title') && s.getAttribute('title').toLowerCase().includes('hijo amado'));
        if (!titleSpan) return JSON.stringify({ error: "Title span not found" });
        const row = titleSpan.closest('div[role="row"]') || titleSpan.closest('div[data-testid^="list-item"]');
        if (!row) return JSON.stringify({ error: "Row not found" });

        // Dispatch mouse events
        ['mousedown', 'mouseup', 'click'].forEach(evt => {
            row.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true, view: window }));
        });

        return JSON.stringify({ success: true });
    })()
    """
    print("Clicking row:", run_js(click_js))
    time.sleep(2)

    check_js = """
    (() => {
        const main = document.querySelector('#main');
        if (!main) return JSON.stringify({ inChat: false, error: "No #main" });
        const header = main.querySelector('header');
        const headerText = header ? header.innerText : "";
        
        // Also look for attach button
        const attachBtn = main.querySelector('div[aria-label="Adjuntar"]') || 
                          main.querySelector('button[aria-label="Adjuntar"]') ||
                          main.querySelector('span[data-icon="plus"]') ||
                          main.querySelector('span[data-icon="attach-menu-plus"]');

        return JSON.stringify({
            inChat: true,
            headerText: headerText,
            hasAttachBtn: !!attachBtn,
            attachBtnHtml: attachBtn ? attachBtn.outerHTML : null
        });
    })()
    """
    print("Chat check:", run_js(check_js))
