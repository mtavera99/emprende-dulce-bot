#!/usr/bin/env python3
import os
import subprocess
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = '/Users/santiagotavera/Desktop/Trabajos/lowticket-bot'
BROLL_DIR = os.path.join(BASE_DIR, 'creatives/broll_helados')
MAT_DIR = os.path.join(BASE_DIR, 'creatives/capcut_material_helados')
STICKER_PATH = os.path.join(MAT_DIR, 'sticker_10000_pesos.png')
FONT_PATH = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'

CLIPS_OUT = '/tmp/helados_v2_clips'
os.makedirs(CLIPS_OUT, exist_ok=True)
SUBS_DIR = '/tmp/helados_v2_subs'
os.makedirs(SUBS_DIR, exist_ok=True)

DESKTOP_DIR = '/Users/santiagotavera/Desktop/CREATIVOS_META_ADS/02_HELADOS_Y_POSTRES_GOURMET'
VIDEOS_DIR = os.path.join(DESKTOP_DIR, 'VIDEOS_VERTICALES_9X16')
CLIPS_CAPCUT_DIR = os.path.join(DESKTOP_DIR, 'CLIPS_NUEVOS_TOMAS_ABIERTAS')
os.makedirs(VIDEOS_DIR, exist_ok=True)
os.makedirs(CLIPS_CAPCUT_DIR, exist_ok=True)

FINAL_VIDEO_DESKTOP = os.path.join(VIDEOS_DIR, '01_Video_Master_Helados_35s_Foodporn.mp4')
FINAL_VIDEO_WITH_VOICE = os.path.join(VIDEOS_DIR, '02_Video_Helados_Con_VozEnOff_37s.mp4')
VOICE_AUDIO = os.path.join(DESKTOP_DIR, 'VOZ_EN_OFF_HELADOS_COLOMBIANA.mp3')
MUSIC_AUDIO = os.path.join(BASE_DIR, 'creatives/music_upbeat.mp3')

font = ImageFont.truetype(FONT_PATH, 42)

subs = [
    ("sub_01.png", "¿QUIERES INICIAR TU NEGOCIO DULCE?", "#FFFFFF", "#E11D48"),
    ("sub_02.png", "MÁS DE 40 RECETAS PASO A PASO EN PDF", "#FDE047", "#0284C7"),
    ("sub_03.png", "HELADOS CREMOSOS SIN MÁQUINA", "#FFFFFF", "#10B981"),
    ("sub_04.png", "POSTRES EN VASO Y PALETAS GOURMET", "#FFFFFF", "#A855F7"),
    ("sub_05.png", "INCLUYE GUÍA DE COSTOS Y PROVEEDORES", "#FDE047", "#D97706"),
    ("sub_06.png", "¡PÍDELO POR WHATSAPP POR $10.000!", "#FFFFFF", "#25D366")
]

for filename, text, text_color, badge_color in subs:
    w, h = 1080, 150
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    
    bbox = d.textbbox((w/2, h/2), text, font=font, anchor='mm')
    box_w = bbox[2] - bbox[0] + 80
    box_h = bbox[3] - bbox[1] + 44
    
    x0, y0 = (w - box_w)/2, (h - box_h)/2
    x1, y1 = x0 + box_w, y0 + box_h
    
    # Shadow
    for offset in range(8, 0, -2):
        d.rounded_rectangle([x0-offset, y0-offset, x1+offset, y1+offset], radius=26, fill=(0, 0, 0, 50))
        
    # Main rounded pill box
    d.rounded_rectangle([x0, y0, x1, y1], radius=22, fill=(15, 23, 42, 235), outline=badge_color, width=5)
    
    # Text with 3D shadow
    d.text((w/2 + 2, h/2 + 2), text, fill=(0, 0, 0, 240), font=font, anchor='mm')
    d.text((w/2, h/2), text, fill=text_color, font=font, anchor='mm')
    
    p = os.path.join(SUBS_DIR, filename)
    img.save(p)

def run(cmd):
    print("RUN:", cmd[:100], "...", flush=True)
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode != 0:
        print("ERR:", r.stderr, flush=True)
        raise RuntimeError(f"Error {r.returncode}")

print("=== 1. Clip Gancho Abierto Cono y Chocolate (4s) ===", flush=True)
# Cono artesanal de fresa con chocolate cayendo en formato nativo vertical 9:16
cmd1 = f"""ffmpeg -y -ss 00:00:00 -t 4.0 -i "{BROLL_DIR}/broll_08_cono_fresa_chocolate.mp4" -i "{STICKER_PATH}" -i "{SUBS_DIR}/sub_01.png" -f lavfi -i anullsrc=r=48000:cl=stereo -filter_complex "
[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30[base];
[1:v]scale=380:-1[stk];
[base][stk]overlay=660:90[v1];
[v1][2:v]overlay=0:1620[outv]
" -map "[outv]" -map 3:a -c:v libx264 -preset ultrafast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 128k -t 4.0 "{CLIPS_OUT}/c1.mp4" """
run(cmd1)

print("=== 2. Clip Pantallazo Real Celular (12s) ===", flush=True)
cmd2 = f"""ffmpeg -y -t 12.0 -i "{MAT_DIR}/02_pantallazo_real_usuario_acceso_pdf.mp4" -i "{STICKER_PATH}" -i "{SUBS_DIR}/sub_02.png" -f lavfi -i anullsrc=r=48000:cl=stereo -filter_complex "
[0:v]scale=72:128,scale=1080:1920:flags=bilinear,setsar=1,fps=30[bg];
[0:v]scale=-2:1620,setsar=1,fps=30[fg];
[bg][fg]overlay=(W-w)/2:(H-h)/2[comp];
[1:v]scale=380:-1[stk];
[comp][stk]overlay=660:90[v1];
[v1][2:v]overlay=0:1620[outv]
" -map "[outv]" -map 3:a -c:v libx264 -preset ultrafast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 128k -t 12.0 "{CLIPS_OUT}/c2.mp4" """
run(cmd2)

print("=== 3. Clip Postres en Vaso y Cono (6s) ===", flush=True)
cmd3 = f"""ffmpeg -y -ss 00:00:00 -t 3.0 -i "{BROLL_DIR}/broll_06_reposteria_armando_capas.mp4" -ss 00:00:00.5 -t 3.0 -i "{BROLL_DIR}/broll_08_cono_fresa_chocolate.mp4" -i "{STICKER_PATH}" -i "{SUBS_DIR}/sub_03.png" -f lavfi -i anullsrc=r=48000:cl=stereo -filter_complex "
[0:v]scale=72:128,boxblur=4:2,scale=1080:1920:flags=bilinear,setsar=1,fps=30[bg0];
[0:v]scale=1080:-2,setsar=1,fps=30[fg0];
[bg0][fg0]overlay=(W-w)/2:(H-h)/2,setsar=1,fps=30[v0];
[1:v]scale=72:128,boxblur=4:2,scale=1080:1920:flags=bilinear,setsar=1,fps=30[bg1];
[1:v]scale=1080:-2,setsar=1,fps=30[fg1];
[bg1][fg1]overlay=(W-w)/2:(H-h)/2,setsar=1,fps=30[v1];
[v0][v1]concat=n=2:v=1:a=0[cat];
[2:v]scale=380:-1[stk];
[cat][stk]overlay=660:90[vstk];
[vstk][3:v]overlay=0:1620[outv]
" -map "[outv]" -map 4:a -c:v libx264 -preset ultrafast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 128k -t 6.0 "{CLIPS_OUT}/c3.mp4" """
run(cmd3)

print("=== 4. Clip Cheesecake y Paletas (5s) ===", flush=True)
cmd4 = f"""ffmpeg -y -ss 00:00:01 -t 2.5 -i "{BROLL_DIR}/broll_09_cuchara_cheesecake_frambuesa.mp4" -ss 00:00:00.5 -t 2.5 -i "{BROLL_DIR}/broll_07_mezcla_dulce_moldes.mp4" -i "{STICKER_PATH}" -i "{SUBS_DIR}/sub_04.png" -f lavfi -i anullsrc=r=48000:cl=stereo -filter_complex "
[0:v]scale=72:128,boxblur=4:2,scale=1080:1920:flags=bilinear,setsar=1,fps=30[bg0];
[0:v]scale=1080:-2,setsar=1,fps=30[fg0];
[bg0][fg0]overlay=(W-w)/2:(H-h)/2,setsar=1,fps=30[v0];
[1:v]scale=72:128,boxblur=4:2,scale=1080:1920:flags=bilinear,setsar=1,fps=30[bg1];
[1:v]scale=1080:-2,setsar=1,fps=30[fg1];
[bg1][fg1]overlay=(W-w)/2:(H-h)/2,setsar=1,fps=30[v1];
[v0][v1]concat=n=2:v=1:a=0[cat];
[2:v]scale=380:-1[stk];
[cat][stk]overlay=660:90[vstk];
[vstk][3:v]overlay=0:1620[outv]
" -map "[outv]" -map 4:a -c:v libx264 -preset ultrafast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 128k -t 5.0 "{CLIPS_OUT}/c4.mp4" """
run(cmd4)

print("=== 5. Clip Oferta $10.000 y Bonos (5s) ===", flush=True)
cmd5 = f"""ffmpeg -y -loop 1 -t 5.0 -i "{BASE_DIR}/creatives/banner_azul_helados_postres_10000_1x1.jpg" -i "{STICKER_PATH}" -i "{SUBS_DIR}/sub_05.png" -f lavfi -i anullsrc=r=48000:cl=stereo -filter_complex "
color=c=#071b38:s=1080x1920:d=5.0[bg];
[0:v]scale=1040:1040,setsar=1,fps=30[banner];
[bg][banner]overlay=(W-w)/2:(H-h)/2-50[comp];
[1:v]scale=380:-1[stk];
[comp][stk]overlay=660:90[v1];
[v1][2:v]overlay=0:1620[outv]
" -map "[outv]" -map 3:a -c:v libx264 -preset ultrafast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 128k -t 5.0 "{CLIPS_OUT}/c5.mp4" """
run(cmd5)

print("=== 6. Clip Cierre WhatsApp (5s) ===", flush=True)
cmd6 = f"""ffmpeg -y -t 5.0 -i "{MAT_DIR}/05_cierre_whatsapp_animado.mp4" -i "{STICKER_PATH}" -i "{SUBS_DIR}/sub_06.png" -f lavfi -i anullsrc=r=48000:cl=stereo -filter_complex "
[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=#06152b,setsar=1,fps=30[base];
[1:v]scale=380:-1[stk];
[base][stk]overlay=660:90[v1];
[v1][2:v]overlay=0:1620[outv]
" -map "[outv]" -map 3:a -c:v libx264 -preset ultrafast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 128k -t 5.0 "{CLIPS_OUT}/c6.mp4" """
run(cmd6)

print("=== Copiando clips individuales para CapCut ===", flush=True)
for i in range(1, 7):
    src = f"{CLIPS_OUT}/c{i}.mp4"
    dst = f"{CLIPS_CAPCUT_DIR}/clip_{i:02d}_toma_abierta.mp4"
    subprocess.run(f"cp -f '{src}' '{dst}'", shell=True)

print("=== Ensamblando Master sin voz para CapCut ===", flush=True)
concat_txt = os.path.join(CLIPS_OUT, 'concat.txt')
with open(concat_txt, 'w') as f:
    for i in range(1, 7):
        f.write(f"file '{CLIPS_OUT}/c{i}.mp4'\n")

cmd_concat = f"""ffmpeg -y -f concat -safe 0 -i "{concat_txt}" -c copy "{FINAL_VIDEO_DESKTOP}" </dev/null"""
run(cmd_concat)

print("=== Ensamblando Versión con Voz en Off Colombiana ===", flush=True)
cmd_with_voice = f"""ffmpeg -y -f concat -safe 0 -i "{concat_txt}" -i "{VOICE_AUDIO}" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest "{FINAL_VIDEO_WITH_VOICE}" </dev/null"""
run(cmd_with_voice)

print("¡PROCESO TERMINADO CON ÉXITO!", flush=True)
