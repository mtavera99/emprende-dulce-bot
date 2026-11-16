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
    const all = Array.from(document.querySelectorAll('*'));
    const matches = all.filter(el => el.children.length === 0 && el.innerText && el.innerText.includes('01_Helados'));
    
    return JSON.stringify(matches.map(m => {
        let p = m;
        let chain = [];
        while (p && p !== document.body && chain.length < 6) {
            chain.push(p.tagName + (p.className ? '.' + p.className.split(' ')[0] : '') + (p.getAttribute('aria-label') ? '[' + p.getAttribute('aria-label') + ']' : ''));
            p = p.parentElement;
        }
        return {
            tag: m.tagName,
            text: m.innerText,
            chain: chain.join(' < ')
        };
    }));
})()
"""
print(run_js(js))
