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
    // Look for all items in file tree or file tabs
    const treeItems = Array.from(document.querySelectorAll('[role="treeitem"], [data-testid*="file-tree-item"], [class*="fileTree"], [class*="tree-item"]'));
    return JSON.stringify(treeItems.map(t => t.innerText.trim()));
})()
"""
print(run_js(js))
