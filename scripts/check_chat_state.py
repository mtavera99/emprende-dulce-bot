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
    const main = document.querySelector('#main');
    if (!main) return "no main";
    const header = main.querySelector('header');
    const footer = main.querySelector('footer');
    
    // Check if there is an exit selection button
    const closeBtn = header ? (header.querySelector('button[aria-label="Cerrar"]') || header.querySelector('span[data-icon="x"]')) : null;

    return JSON.stringify({
        header: header ? header.innerText : null,
        hasCloseBtn: !!closeBtn,
        hasFooter: !!footer,
        footerText: footer ? footer.innerText : null
    });
})()
"""
print(run_js(js))
