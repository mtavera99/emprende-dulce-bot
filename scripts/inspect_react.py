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

    // Check react keys
    const getReactProps = (el) => {
        const key = Object.keys(el).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactProps$') || k.startsWith('__reactEvents$'));
        return key ? { key, props: Object.keys(el[key] || {}) } : null;
    };

    let el = item.querySelector('[data-testid="cell-frame-container"]');
    let info = [];
    while (el && el !== document.body) {
        const r = getReactProps(el);
        if (r) {
            info.push({ tag: el.tagName, testId: el.getAttribute('data-testid'), role: el.getAttribute('role'), ...r });
        }
        el = el.parentElement;
    }
    return JSON.stringify(info);
})()
"""
print(run_js(js))
