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

js = """
(() => {
    const item = document.querySelector('div[data-testid="list-item-6"]');
    if (!item) return "item 6 not found";
    
    const container = item.querySelector('[data-testid="cell-frame-container"]') || item;
    
    // Focus and click
    container.focus();
    container.click();
    
    // Also try dispatching click on gridcell
    const gridcell = item.querySelector('div[role="gridcell"][tabindex="0"]');
    if (gridcell) {
        gridcell.focus();
        gridcell.click();
    }
    
    return "clicked container & gridcell";
})()
"""
print(run_js(js))
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
