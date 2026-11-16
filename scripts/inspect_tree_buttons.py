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
    // Find all tree items
    const treeItems = Array.from(document.querySelectorAll('[role="treeitem"], [data-testid*="file-tree-item"], [class*="fileTree"], [class*="tree-item"]'));
    return JSON.stringify(treeItems.map(item => {
        const btns = Array.from(item.querySelectorAll('button, [role="button"]'));
        return {
            text: item.innerText.trim(),
            buttons: btns.map(b => b.getAttribute('aria-label') || b.getAttribute('title') || b.className)
        };
    }));
})()
"""
print(run_js(js))
