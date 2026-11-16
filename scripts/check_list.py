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
    const listItems = Array.from(document.querySelectorAll('div[data-testid^="list-item"]'));
    return JSON.stringify(listItems.map((item, idx) => ({
        idx,
        testId: item.getAttribute('data-testid'),
        title: item.querySelector('span[title]') ? item.querySelector('span[title]').getAttribute('title') : null,
        text: item.innerText.split('\\n')[0]
    })));
})()
"""
print(run_js(js))
