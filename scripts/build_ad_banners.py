import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs('creatives', exist_ok=True)

def get_font(size, bold=False):
    font_paths = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()

def create_ad_1():
    src_path = 'creatives/creativo_1_foodporn_chatgpt_1x1.png'
    img = Image.open(src_path).convert('RGBA')
    img = img.resize((1080, 1080), Image.Resampling.LANCZOS)
    
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Top banner gradient / card
    draw.rectangle([0, 0, 1080, 130], fill=(15, 23, 42, 235))
    draw.rectangle([0, 126, 1080, 130], fill=(245, 158, 11, 255)) # Gold line
    
    f_top = get_font(34, bold=True)
    f_sub = get_font(21, bold=False)
    
    draw.text((540, 45), "PACK 3 EN 1: HELADOS Y POSTRES EN VASO", fill=(255, 255, 255), font=f_top, anchor="mm")
    draw.text((540, 92), "Aprende las 30+ recetas mas vendidas de Colombia · Sin maquina industrial", fill=(253, 230, 138), font=f_sub, anchor="mm")
    
    # Bottom CTA Card
    draw.rectangle([0, 910, 1080, 1080], fill=(15, 23, 42, 245))
    draw.rectangle([0, 910, 1080, 914], fill=(245, 158, 11, 255))
    
    # Price Badge on left
    draw.rounded_rectangle([40, 930, 470, 1060], radius=16, fill=(245, 158, 11, 255))
    f_price_label = get_font(20, bold=True)
    f_price = get_font(44, bold=True)
    draw.text((255, 960), "PAGO UNICO HOY", fill=(15, 23, 42), font=f_price_label, anchor="mm")
    draw.text((255, 1015), "$10.000 COP", fill=(15, 23, 42), font=f_price, anchor="mm")
    
    # WhatsApp CTA on right
    draw.rounded_rectangle([495, 930, 1040, 1060], radius=16, fill=(16, 185, 129, 255))
    f_cta = get_font(32, bold=True)
    f_cta_sub = get_font(20, bold=False)
    draw.text((767, 965), "PIDELO AL WHATSAPP", fill=(255, 255, 255), font=f_cta, anchor="mm")
    draw.text((767, 1015), "Paga seguro con Nequi o Daviplata · Acceso Ya", fill=(255, 255, 255), font=f_cta_sub, anchor="mm")
    
    # Floating bonus badge top right
    draw.rounded_rectangle([720, 155, 1050, 225], radius=12, fill=(225, 29, 72, 240))
    f_bonus = get_font(22, bold=True)
    draw.text((885, 190), "+ 3 BONOS DE REGALO", fill=(255, 255, 255), font=f_bonus, anchor="mm")
    
    result = Image.alpha_composite(img, overlay).convert('RGB')
    out_path = 'creatives/anuncio_1_pack_completo_1080x1080.png'
    result.save(out_path, 'PNG', quality=95)
    print(f"Generated {out_path}")

def create_ad_2():
    src_path = 'creatives/creativo_2_pov_chatgpt_9x16.png'
    img = Image.open(src_path).convert('RGBA')
    img = img.resize((1080, 1920), Image.Resampling.LANCZOS)
    
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Top Story Header
    draw.rounded_rectangle([50, 120, 1030, 250], radius=24, fill=(15, 23, 42, 235))
    draw.rounded_rectangle([50, 120, 1030, 250], radius=24, outline=(245, 158, 11, 255), width=3)
    f_story_title = get_font(36, bold=True)
    f_story_sub = get_font(24, bold=False)
    draw.text((540, 165), "¿QUIERES EMPRENDER DESDE TU COCINA?", fill=(253, 230, 138), font=f_story_title, anchor="mm")
    draw.text((540, 210), "Aprende el negocio de Postres en Vaso de alta venta", fill=(255, 255, 255), font=f_story_sub, anchor="mm")
    
    # Mid Floating Margin Badge
    draw.rounded_rectangle([50, 310, 500, 410], radius=18, fill=(16, 185, 129, 240))
    f_margin = get_font(24, bold=True)
    f_margin_sub = get_font(21, bold=False)
    draw.text((275, 345), "MARGEN REAL HASTA 62%", fill=(255, 255, 255), font=f_margin, anchor="mm")
    draw.text((275, 385), "Costo $2.500 · Venta $7.000+", fill=(255, 255, 255), font=f_margin_sub, anchor="mm")
    
    # Bottom Story Footer
    draw.rectangle([0, 1600, 1080, 1920], fill=(15, 23, 42, 245))
    draw.rectangle([0, 1600, 1080, 1606], fill=(245, 158, 11, 255))
    
    f_offer_badge = get_font(26, bold=True)
    draw.text((540, 1650), "PACK COMPLETO POR SOLO $10.000 COP", fill=(245, 158, 11), font=f_offer_badge, anchor="mm")
    
    f_detail = get_font(21, bold=False)
    draw.text((540, 1700), "Helados Artesanales + Postres en Vaso + Guia Navideña + Excel de Costeo", fill=(226, 232, 240), font=f_detail, anchor="mm")
    
    # Green WhatsApp Button
    draw.rounded_rectangle([80, 1750, 1000, 1870], radius=24, fill=(16, 185, 129, 255))
    f_btn = get_font(38, bold=True)
    f_btn_sub = get_font(22, bold=False)
    draw.text((540, 1795), "TOCA AQUI PARA PEDIRLO", fill=(255, 255, 255), font=f_btn, anchor="mm")
    draw.text((540, 1840), "Pago seguro por Nequi o Daviplata · Entrega inmediata", fill=(255, 255, 255), font=f_btn_sub, anchor="mm")
    
    result = Image.alpha_composite(img, overlay).convert('RGB')
    out_path = 'creatives/anuncio_2_story_pov_1080x1920.png'
    result.save(out_path, 'PNG', quality=95)
    print(f"Generated {out_path}")

def create_ad_3():
    src_path = 'creatives/creativo_3_caja_emprendimiento_1x1.png'
    img = Image.open(src_path).convert('RGBA')
    img = img.resize((1080, 1080), Image.Resampling.LANCZOS)
    
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Top banner
    draw.rectangle([0, 0, 1080, 120], fill=(15, 23, 42, 235))
    draw.rectangle([0, 116, 1080, 120], fill=(245, 158, 11, 255))
    
    f_top = get_font(32, bold=True)
    f_sub = get_font(21, bold=False)
    draw.text((540, 45), "APRENDE A ARMAR CAJAS DE REGALO PARA VENDER", fill=(255, 255, 255), font=f_top, anchor="mm")
    draw.text((540, 85), "Temporada Navideña y Todo el Año · Negocio 100% Rentable", fill=(253, 230, 138), font=f_sub, anchor="mm")
    
    # Bottom CTA Card
    draw.rectangle([0, 920, 1080, 1080], fill=(15, 23, 42, 240))
    draw.rectangle([0, 920, 1080, 924], fill=(245, 158, 11, 255))
    
    # Left price pill
    draw.rounded_rectangle([40, 940, 460, 1060], radius=16, fill=(245, 158, 11, 255))
    f_price_tag = get_font(20, bold=True)
    f_price = get_font(44, bold=True)
    draw.text((250, 970), "OFERTA ESPECIAL", fill=(15, 23, 42), font=f_price_tag, anchor="mm")
    draw.text((250, 1020), "$10.000 COP", fill=(15, 23, 42), font=f_price, anchor="mm")
    
    # Right CTA
    draw.rounded_rectangle([490, 940, 1040, 1060], radius=16, fill=(16, 185, 129, 255))
    f_cta = get_font(28, bold=True)
    f_cta_sub = get_font(20, bold=False)
    draw.text((765, 975), "ACCESO INMEDIATO POR WHATSAPP", fill=(255, 255, 255), font=f_cta, anchor="mm")
    draw.text((765, 1020), "Paga con Nequi • Daviplata • Llave Bre-B", fill=(255, 255, 255), font=f_cta_sub, anchor="mm")
    
    result = Image.alpha_composite(img, overlay).convert('RGB')
    out_path = 'creatives/anuncio_3_caja_emprendimiento_1080x1080.png'
    result.save(out_path, 'PNG', quality=95)
    print(f"Generated {out_path}")

if __name__ == '__main__':
    create_ad_1()
    create_ad_2()
    create_ad_3()
    print("Clean banner generation completed!")
