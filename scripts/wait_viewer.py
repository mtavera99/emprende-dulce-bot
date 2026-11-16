import subprocess
import json
import time

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

for i in range(15):
    time.sleep(3)
    js = """
    (() => {
        const stopBtn = document.querySelector('button[aria-label*="Stop"], button[title*="Stop"]');
        return JSON.stringify({ isGenerating: !!stopBtn });
    })()
    """
    res = json.loads(run_js(js))
    print(f"[{i+1}] isGenerating: {res['isGenerating']}")
    if not res['isGenerating']:
        print("Opus 5.5 finished!")
        break
