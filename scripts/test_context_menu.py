import subprocess
import json
import time

def run_js(js_code):
    as_script = f'''
tell application "Google Chrome"
    tell tab 5 of window 1
        execute javascript {json.dumps(js_code)}
    end tell
end tell
'''
    res = subprocess.run(["osascript", "-e", as_script], capture_output=True, text=True)
    return res.stdout.strip()

js = """
(() => {
    const items = Array.from(document.querySelectorAll('[role="treeitem"]'));
    const item = items.find(i => i.innerText.includes('01_Helados'));
    if (!item) return "item not found";

    // Trigger contextmenu event
    const rect = item.getBoundingClientRect();
    const evt = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect.left + 20,
        clientY: rect.top + 10,
        button: 2
    });
    item.dispatchEvent(evt);
    return "dispatched contextmenu";
})()
"""
print(run_js(js))
time.sleep(1)

js_menu = """
(() => {
    const menuItems = Array.from(document.querySelectorAll('[role="menuitem"], [class*="menuItem"], [class*="contextMenu"]'));
    return JSON.stringify(menuItems.map(m => m.innerText));
})()
"""
print(run_js(js_menu))
