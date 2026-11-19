#!/usr/bin/env python3
import os
import subprocess
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = '/Users/santiagotavera/Desktop/Trabajos/lowticket-bot'
BROLL_DIR = os.path.join(BASE_DIR, 'creatives/broll_helados')
MAT_DIR = os.path.join(BASE_DIR, 'creatives/capcut_material_helados')
CLIPS_DIR = os.path.join(BASE_DIR, 'creatives/capcut_clips_helados')
OUT_MASTER = os.path.join(BASE_DIR, 'creatives/anuncio_final_helados_35s_master.mp4')
SUBS_DIR = '/tmp/video_subtitles_helados'

os.makedirs(CLIPS_DIR, exist_ok=True)
os.makedirs(SUBS_DIR, exist_ok=True)

STICKER_PATH = os.path.join(MAT_DIR, 'sticker_10000_pesos.png')
FONT_PATH = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'

def run_cmd(cmd):
    print("RUNNING:", cmd)
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        print("STDERR:", res.stderr)
        raise RuntimeError(f"Command failed with code {res.returncode}")
    return res.stdout

print("=== STEP 0: Generando Subtitle Pills con PIL ===")
font = ImageFont.truetype(FONT_PATH, 42)

subs = [
    ("sub_01.png", "¿HELADOS CREMOSOS SIN MÁQUINA?", "#FFFFFF", "#E11D48"),
    ("sub_02.png", "MÁS DE 40 RECETAS PASO A PASO", "#FDE047", "#0284C7"),
    ("sub_03.png", "ACCESO INMEDIATO EN TU CELULAR", "#FFFFFF", "#10B981"),
    ("sub_04.png", "POSTRES EN VASO Y HELADOS GOURMET", "#FFFFFF", "#A855F7"),
    ("sub_05.png", "INCLUYE CALCULADORA DE COSTOS EXCEL", "#FDE047", "#D97706"),
    ("sub_06.png", "¡PÍDELO POR WHATSAPP AHORA!", "#FFFFFF", "#25D366")
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
print("Subtitles ready in", SUBS_DIR)

print("=== STEP 1: Clip 1 (Gancho Helado Cremoso 3.5s) ===")
cmd1 = f"""ffmpeg -y -ss 00:00:00 -t 3.5 -i "{BROLL_DIR}/broll_01_helado_caramelo.mp4" -i "{STICKER_PATH}" -i "{SUBS_DIR}/sub_01.png" -f lavfi -i anullsrc=r=48000:cl=stereo -filter_complex "
[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30[vid];
[1:v]scale=380:-1[stk];
[vid][stk]overlay=660:90[v1];
[v1][2:v]overlay=0:1620[outv]
" -map "[outv]" -map 3:a -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 128k -t 3.5 "{CLIPS_DIR}/01_gancho_helado_cremoso_3.5s.mp4" """
run_cmd(cmd1)

print("=== STEP 2: Clip 2 (Manga Pastelera + Cono Fresa 4s) ===")
cmd2 = f"""ffmpeg -y -ss 00:00:02.0 -t 2.0 -i "{BROLL_DIR}/broll_06_reposteria_armando_capas.mp4" -ss 00:00:01.0 -t 2.0 -i "{BROLL_DIR}/broll_08_cono_fresa_chocolate.mp4" -i "{STICKER_PATH}" -i "{SUBS_DIR}/sub_02.png" -f lavfi -i anullsrc=r=48000:cl=stereo -filter_complex "
[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30[v0];
[1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30[v1];
[v0][v1]concat=n=2:v=1:a=0[cat];
[2:v]scale=380:-1[stk];
[cat][stk]overlay=660:90[v1];
[v1][3:v]overlay=0:1620[outv]
" -map "[outv]" -map 4:a -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 128k -t 4.0 "{CLIPS_DIR}/02_manga_pastelera_y_cono_4s.mp4" """
run_cmd(cmd2)

print("=== STEP 3: Clip 3 (Pantallazo Real Usuario 12s) ===")
cmd3 = f"""ffmpeg -y -t 12.0 -i "{MAT_DIR}/02_pantallazo_real_usuario_acceso_pdf.mp4" -i "{STICKER_PATH}" -i "{SUBS_DIR}/sub_03.png" -f lavfi -i anullsrc=r=48000:cl=stereo -filter_complex "
[0:v]scale=72:128,scale=1080:1920:flags=bilinear,setsar=1,fps=30[bg];
[0:v]scale=-1:1620,setsar=1,fps=30[fg];
[bg][fg]overlay=(W-w)/2:(H-h)/2[comp];
[1:v]scale=380:-1[stk];
[comp][stk]overlay=660:90[v1];
[v1][2:v]overlay=0:1620[outv]
" -map "[outv]" -map 3:a -c:v libx264 -preset ultrafast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 128k -t 12.0 "{CLIPS_DIR}/03_pantallazo_real_usuario_12s.mp4" """
run_cmd(cmd3)

print("=== STEP 4: Clip 4 (Cuchara Cheesecake + Cascada Chocolate 4.5s) ===")
cmd4 = f"""ffmpeg -y -ss 00:00:01.5 -t 2.2 -i "{BROLL_DIR}/broll_09_cuchara_cheesecake_frambuesa.mp4" -ss 00:00:02.0 -t 2.3 -i "{BROLL_DIR}/broll_04_cascada_chocolate_liquido.mp4" -i "{STICKER_PATH}" -i "{SUBS_DIR}/sub_04.png" -f lavfi -i anullsrc=r=48000:cl=stereo -filter_complex "
[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30[v0];
[1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30[v1];
[v0][v1]concat=n=2:v=1:a=0[cat];
[2:v]scale=380:-1[stk];
[cat][stk]overlay=660:90[v1];
[v1][3:v]overlay=0:1620[outv]
" -map "[outv]" -map 4:a -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 128k -t 4.5 "{CLIPS_DIR}/04_cuchara_y_cascada_chocolate_4.5s.mp4" """
run_cmd(cmd4)

print("=== STEP 5: Clip 5 (Banner Oferta + Calculadora Excel 5s) ===")
cmd5 = f"""ffmpeg -y -loop 1 -t 5.0 -i "{BASE_DIR}/creatives/banner_azul_helados_postres_10000_1x1.jpg" -i "{STICKER_PATH}" -i "{SUBS_DIR}/sub_05.png" -f lavfi -i anullsrc=r=48000:cl=stereo -filter_complex "
color=c=#071b38:s=1080x1920:d=5.0[bg];
[0:v]scale=1040:1040,setsar=1,fps=30[banner];
[bg][banner]overlay=(W-w)/2:(H-h)/2-50[comp];
[1:v]scale=380:-1[stk];
[comp][stk]overlay=660:90[v1];
[v1][2:v]overlay=0:1620[outv]
" -map "[outv]" -map 3:a -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 128k -t 5.0 "{CLIPS_DIR}/05_banner_oferta_calculadora_5s.mp4" """
run_cmd(cmd5)

print("=== STEP 6: Clip 6 (Cierre WhatsApp Boutique Poster 5.5s) ===")
cmd6 = f"""ffmpeg -y -loop 1 -t 5.5 -i "{BASE_DIR}/creatives/poster_boutique_helados_postres_10000_1x1.jpg" -i "{STICKER_PATH}" -i "{SUBS_DIR}/sub_06.png" -f lavfi -i anullsrc=r=48000:cl=stereo -filter_complex "
color=c=#071b38:s=1080x1920:d=5.5[bg];
[0:v]scale=1040:1040,setsar=1,fps=30[poster];
[bg][poster]overlay=(W-w)/2:(H-h)/2-50[comp];
[1:v]scale=380:-1[stk];
[comp][stk]overlay=660:90[v1];
[v1][2:v]overlay=0:1620[outv]
" -map "[outv]" -map 3:a -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 128k -t 5.5 "{CLIPS_DIR}/06_cierre_whatsapp_animado_5.5s.mp4" """
run_cmd(cmd6)

print("=== STEP 7: Ensamblando Video Master de 34.5s ===")
concat_list = os.path.join(CLIPS_DIR, 'concat_list.txt')
clips = [
    '01_gancho_helado_cremoso_3.5s.mp4',
    '02_manga_pastelera_y_cono_4s.mp4',
    '03_pantallazo_real_usuario_12s.mp4',
    '04_cuchara_y_cascada_chocolate_4.5s.mp4',
    '05_banner_oferta_calculadora_5s.mp4',
    '06_cierre_whatsapp_animado_5.5s.mp4'
]

with open(concat_list, 'w') as f:
    for c in clips:
        f.write(f"file '{os.path.join(CLIPS_DIR, c)}'\n")

cmd_master = f"""ffmpeg -y -f concat -safe 0 -i "{concat_list}" -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 128k -r 30 "{OUT_MASTER}" """
run_cmd(cmd_master)

print("=== ALL COMPLETED SUCCESSFULLY! ===")
