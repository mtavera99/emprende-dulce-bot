import subprocess
import json

def run_js_in_tab(tab_idx, js_code):
    as_script = f'''
tell application "Google Chrome"
    tell tab {tab_idx} of window 1
        execute javascript {json.dumps(js_code)}
    end tell
end tell
'''
    res = subprocess.run(["osascript", "-e", as_script], capture_output=True, text=True)
    if res.returncode != 0:
        print("AppleScript Error:", res.stderr)
        return None
    return res.stdout.strip()

def activate_tab(tab_idx):
    as_script = f'''
tell application "Google Chrome"
    activate
    set active tab index of window 1 to {tab_idx}
end tell
'''
    subprocess.run(["osascript", "-e", as_script])

if __name__ == "__main__":
    activate_tab(8)
    js = """
    (() => {
        const titleSpan = document.querySelector('span[title="Hijo Amado"]') || 
                          Array.from(document.querySelectorAll('span')).find(s => s.getAttribute('title') && s.getAttribute('title').toLowerCase().includes('hijo amado')) ||
                          Array.from(document.querySelectorAll('span')).find(s => s.textContent && s.textContent.toLowerCase().includes('hijo amado'));
        if (titleSpan) {
            const row = titleSpan.closest('div[role="row"]') || titleSpan.closest('div[data-testid^="list-item"]');
            return JSON.stringify({
                found: true,
                title: titleSpan.getAttribute('title'),
                text: titleSpan.textContent,
                hasRow: !!row,
                rowTestId: row ? row.getAttribute('data-testid') : null
            });
        }
        return JSON.stringify({ found: false, url: window.location.href });
    })()
    """
    res = run_js_in_tab(8, js)
    print("Result:", res)
