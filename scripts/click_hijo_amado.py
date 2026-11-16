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
    return res.stdout.strip()

js_click = """
(() => {
    const item = document.querySelector('div[data-testid="list-item-6"]');
    if (!item) return JSON.stringify({ error: "item 6 not found" });
    
    // Find the clickable element inside item
    const target = item.querySelector('div[role="listitem"]') || item.querySelector('div[tabindex]') || item;
    
    const rect = target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    ['mousedown', 'mouseup', 'click'].forEach(type => {
        const evt = new MouseEvent(type, {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y
        });
        target.dispatchEvent(evt);
    });

    return JSON.stringify({ clicked: true, itemText: item.innerText });
})()
"""

print(run_js(js_click))
time.sleep(1.5)

js_header = """
(() => {
    const header = document.querySelector('#main header');
    return JSON.stringify({
        headerText: header ? header.innerText : null
    });
})()
"""
print(run_js(js_header))
