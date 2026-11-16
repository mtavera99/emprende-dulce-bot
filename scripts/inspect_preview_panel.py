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
    const span = Array.from(document.querySelectorAll('span')).find(s => s.innerText && s.innerText.includes('01_Helados'));
    if (!span) return "no span";
    
    // Find the enclosing modal / panel / container
    let container = span;
    while (container && container.parentElement && !container.classList.contains('x1n2onr6')) {
        container = container.parentElement;
    }
    // Climb up 5 more levels
    for (let i = 0; i < 6 && container.parentElement; i++) {
        container = container.parentElement;
    }
    
    // Find all buttons and SVGs in container
    const buttons = Array.from(container.querySelectorAll('button, [role="button"], span[data-icon]'));
    return JSON.stringify({
        containerTag: container.tagName,
        containerClass: container.className,
        buttons: buttons.map(b => ({
            tag: b.tagName,
            ariaLabel: b.getAttribute('aria-label'),
            dataIcon: b.getAttribute('data-icon'),
            text: b.innerText,
            html: b.outerHTML.substring(0, 150)
        }))
    });
})()
"""
print(run_js(js))
