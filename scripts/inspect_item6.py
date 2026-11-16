import subprocess
import json

def run_js(js_code):
    as_script = f'''
tell application "Google Chrome"
    tell tab 8 of window 1
        execute javascript {json.dumps(js_code)}
    end tell
end tell
'''
    res = subprocess.run(["osascript", "-e", as_script], capture_output=True, text=True)
    return res.stdout.strip()

js = """
(() => {
    const item = document.querySelector('div[data-testid="list-item-6"]');
    if (!item) return "item 6 not found";
    
    // Inspect all descendants with event handlers or roles
    const elements = Array.from(item.querySelectorAll('*'));
    return JSON.stringify(elements.map(el => ({
        tag: el.tagName,
        className: el.className,
        role: el.getAttribute('role'),
        tabIndex: el.getAttribute('tabindex'),
        testId: el.getAttribute('data-testid')
    })));
})()
"""
print(run_js(js))
