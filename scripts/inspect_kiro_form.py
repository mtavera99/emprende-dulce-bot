import subprocess
import json

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
    const ta = document.querySelector('textarea');
    if (!ta) return "no textarea";
    
    // Find parent form or wrapper
    const form = ta.closest('form') || ta.parentElement.parentElement;
    const buttons = Array.from(form.querySelectorAll('button'));
    
    return JSON.stringify({
        formTag: form.tagName,
        formClass: form.className,
        buttons: buttons.map(b => ({
            ariaLabel: b.getAttribute('aria-label'),
            disabled: b.disabled,
            title: b.getAttribute('title'),
            text: b.innerText,
            html: b.outerHTML.substring(0, 150)
        }))
    });
})()
"""
print(run_js(js))
