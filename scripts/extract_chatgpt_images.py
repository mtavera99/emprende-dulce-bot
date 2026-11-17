import subprocess, os, base64, json, sys

def run_applescript(script):
    res = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)
    if res.returncode != 0:
        print("AppleScript error:", res.stderr)
    return res.stdout.strip()

def extract_image(img_index, out_path):
    print(f"Extracting image #{img_index} to {out_path}...")
    init_js = f"""
    (function() {{
        var imgs = Array.from(document.querySelectorAll("img")).filter(i => i.src && (i.src.includes("files.oaiusercontent.com") || i.src.includes("dall-e") || i.src.startsWith("blob:")));
        if (imgs.length <= {img_index}) return "INDEX_OUT_OF_BOUNDS: " + imgs.length;
        var img = imgs[{img_index}];
        var canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var dataUrl = canvas.toDataURL("image/png");
        window.__chatgpt_extracted = dataUrl.split(",")[1];
        return "READY:" + window.__chatgpt_extracted.length + ":" + canvas.width + "x" + canvas.height;
    }})()
    """
    escaped_js = init_js.replace('\\', '\\\\').replace('"', '\\"')
    
    script = f'''
    tell application "Google Chrome"
      set winList to every window
      repeat with w in winList
        set tabList to every tab of w
        repeat with t in tabList
          if URL of t contains "chatgpt.com" then
            set res to execute t javascript "{escaped_js}"
            return res
          end if
        end repeat
      end repeat
    end tell
    return "NOT_FOUND"
    '''
    
    res = run_applescript(script)
    print("Init result:", res)
    if not res.startswith("READY:"):
        print("Failed to initialize canvas extraction")
        return False
    
    parts = res.split(":")
    total_len = int(parts[1])
    dims = parts[2]
    print(f"Total base64 length: {total_len} chars, dimensions: {dims}")
    
    chunk_size = 50000
    b64_chunks = []
    for offset in range(0, total_len, chunk_size):
        chunk_js = f"window.__chatgpt_extracted.slice({offset}, {offset + chunk_size})"
        c_script = f'''
        tell application "Google Chrome"
          set winList to every window
          repeat with w in winList
            set tabList to every tab of w
            repeat with t in tabList
              if URL of t contains "chatgpt.com" then
                return execute t javascript "{chunk_js}"
              end if
            end repeat
          end repeat
        end tell
        '''
        chunk = run_applescript(c_script)
        b64_chunks.append(chunk)
    
    full_b64 = "".join(b64_chunks)
    img_bytes = base64.b64decode(full_b64)
    with open(out_path, "wb") as f:
        f.write(img_bytes)
    print(f"Saved {out_path} ({len(img_bytes)} bytes)")
    return True

if __name__ == "__main__":
    os.makedirs("/Users/santiagotavera/Desktop/Trabajos/lowticket-bot/creatives/chatgpt", exist_ok=True)
    extract_image(0, "/Users/santiagotavera/Desktop/Trabajos/lowticket-bot/creatives/chatgpt/chatgpt_angulo1_foodporn_1x1.png")
    extract_image(1, "/Users/santiagotavera/Desktop/Trabajos/lowticket-bot/creatives/chatgpt/chatgpt_angulo2_pov_banoffee_9x16.png")
    extract_image(2, "/Users/santiagotavera/Desktop/Trabajos/lowticket-bot/creatives/chatgpt/chatgpt_angulo3_caja_reposteria_1x1.png")
