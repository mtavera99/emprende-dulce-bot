import subprocess
import json
import time

for i in range(15):
    res = subprocess.run(["python3", "dump_kiro.py"], capture_output=True, text=True)
    out = res.stdout
    is_gen = "isGenerating: True" in out
    print(f"[{i+1}] isGenerating: {is_gen}")
    if not is_gen:
        print("\n=== OPUS 5.5 FINISHED ===")
        print(out)
        break
    time.sleep(5)
