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
    const span = document.querySelector('span[title="Hijo Amado"]');
    if (!span) return JSON.stringify({ error: "span not found" });

    const rect = span.getBoundingClientRect();
    const x = rect.left + 10;
    const y = rect.top + 10;
    
    const target = document.elementFromPoint(x, y);

    const events = ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'];
    const eventResults = [];

    events.forEach(evtType => {
        let evt;
        if (evtType.startsWith('pointer')) {
            evt = new PointerEvent(evtType, {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: x,
                clientY: y,
                button: 0,
                buttons: evtType === 'pointerdown' ? 1 : 0,
                isPrimary: true,
                pointerId: 1,
                pointerType: 'mouse'
            });
        } else {
            evt = new MouseEvent(evtType, {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: x,
                clientY: y,
                button: 0,
                buttons: evtType === 'mousedown' ? 1 : 0
            });
        }
        target.dispatchEvent(evt);
    });

    return JSON.stringify({
        targetTag: target.tagName,
        targetClass: target.className,
        x, y
    });
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
