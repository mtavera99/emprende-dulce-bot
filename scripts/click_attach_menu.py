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
    const attachBtn = document.querySelector('button[aria-label="Adjuntar"]');
    if (!attachBtn) return "no attach btn";
    attachBtn.click();
    return "clicked attach btn";
})()
"""
print(run_js(js_click))
time.sleep(1)

js_menu = """
(() => {
    const inputs = Array.from(document.querySelectorAll('input[type="file"]'));
    const menuItems = Array.from(document.querySelectorAll('ul li, [role="menuitem"], [role="button"]'));
    return JSON.stringify({
        inputs: inputs.map(inp => ({
            accept: inp.getAttribute('accept'),
            multiple: inp.multiple,
            parent: inp.parentElement ? inp.parentElement.tagName : null,
            outerHTML: inp.outerHTML
        })),
        menuItems: menuItems.filter(el => el.innerText && el.innerText.trim().length > 0 && el.innerText.trim().length < 30).map(el => el.innerText.trim()).slice(0, 15)
    });
})()
"""
print(run_js(js_menu))
