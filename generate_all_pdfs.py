import os
import hashlib

# Monkeypatch para compatibilidad de ReportLab con Python 3.8 openssl_md5
_orig_md5 = hashlib.md5
def _patched_md5(*args, **kwargs):
    kwargs.pop('usedforsecurity', None)
    return _orig_md5(*args, **kwargs)
hashlib.md5 = _patched_md5

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

OUTPUT_DIR = "/Users/santiagotavera/Desktop/Trabajos/lowticket-bot/dist_pdfs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Paleta de colores profesional
PRIMARY = colors.HexColor("#881337")      # Vino tinto oscuro elegante
ACCENT = colors.HexColor("#e11d48")       # Rosa frambuesa vivo
DARK_TEXT = colors.HexColor("#1e293b")    # Slate oscuro para lectura
MUTED = colors.HexColor("#64748b")        # Gris medio
CARD_BG = colors.HexColor("#fff1f2")      # Rosa ultra claro para cajas de tips
BORDER_COLOR = colors.HexColor("#fecdd3") # Borde sutil

def create_pdf(filename, title, subtitle, sections):
    pdf_path = os.path.join(OUTPUT_DIR, filename)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=45,
        leftMargin=45,
        topMargin=45,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()

    # Estilos tipográficos
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=PRIMARY,
        alignment=1, # Centrado
        spaceAfter=15
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=MUTED,
        alignment=1,
        spaceAfter=25
    )

    badge_style = ParagraphStyle(
        'CoverBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white,
        alignment=1
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=ACCENT,
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=DARK_TEXT,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=DARK_TEXT,
        leftIndent=15,
        spaceAfter=4
    )

    card_text_style = ParagraphStyle(
        'CardText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=DARK_TEXT
    )

    story = []

    # --- PORTADA ELEGANTE ---
    story.append(Spacer(1, 30))
    # Badge superior
    badge_table = Table([[Paragraph("COLECCIÓN EXCLUSIVA 2026 • EMPRENDE DULCE", badge_style)]], colWidths=[320])
    badge_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ACCENT),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('CORNERPAD', (0,0), (-1,-1), 6)
    ]))
    story.append(badge_table)
    story.append(Spacer(1, 40))

    story.append(Paragraph(title, title_style))
    story.append(Paragraph(subtitle, subtitle_style))
    story.append(Spacer(1, 100))

    # Caja de metadatos de portada
    meta_box = [
        [Paragraph("<b>Edición:</b> Formato Comercial E-Book", body_style), Paragraph("<b>Uso:</b> Emprendimiento desde Casa", body_style)],
        [Paragraph("<b>País:</b> Colombia & Latinoamérica", body_style), Paragraph("<b>Garantía:</b> Técnicas 100% Probadas", body_style)]
    ]
    meta_table = Table(meta_box, colWidths=[240, 240])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 15),
        ('RIGHTPADDING', (0,0), (-1,-1), 15),
    ]))
    story.append(meta_table)

    story.append(PageBreak())

    # --- CONTENIDO DE LAS SECCIONES ---
    for sec in sections:
        sec_type = sec.get("type", "p")
        if sec_type == "h1":
            story.append(Paragraph(sec["text"], h1_style))
            story.append(HRFlowable(width="100%", thickness=1, color=BORDER_COLOR, spaceBefore=2, spaceAfter=8))
        elif sec_type == "h2":
            story.append(Paragraph(sec["text"], h2_style))
        elif sec_type == "p":
            story.append(Paragraph(sec["text"], body_style))
        elif sec_type == "bullet":
            story.append(Paragraph(f"• {sec['text']}", bullet_style))
        elif sec_type == "card":
            card_content = [[Paragraph(f"<b>💡 {sec['title']}:</b><br/>{sec['text']}", card_text_style)]]
            t = Table(card_content, colWidths=[480])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
                ('BOX', (0,0), (-1,-1), 1, ACCENT),
                ('TOPPADDING', (0,0), (-1,-1), 8),
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ('LEFTPADDING', (0,0), (-1,-1), 12),
                ('RIGHTPADDING', (0,0), (-1,-1), 12),
            ]))
            story.append(Spacer(1, 4))
            story.append(t)
            story.append(Spacer(1, 6))
        elif sec_type == "break":
            story.append(PageBreak())

    def add_page_number(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(MUTED)
        if doc.page > 1:
            page_text = f"Emprende Dulce • Manual de Negocio — Página {doc.page}"
            canvas.drawRightString(letter[0] - 45, 25, page_text)
        canvas.restoreState()

    doc.build(story, onFirstPage=lambda c, d: None, onLaterPages=add_page_number)
    print(f"🎉 Creado exitosamente: {pdf_path}")


# ==========================================================
# DEFINICIÓN DEL CONTENIDO DE LOS MANUALES
# ==========================================================

# 1. HELADOS ARTESANALES
create_pdf(
    "01_Helados_Artesanales_Guia_Maestra.pdf",
    "El Negocio de los Helados Artesanales Sin Máquina",
    "Fórmulas comerciales, técnica de cremosidad y recetas gourmet para emprender desde tu cocina sin maquinaria costosa.",
    [
        {"type": "h1", "text": "1. El Secreto Científico de la Cremosidad"},
        {"type": "p", "text": "El problema clásico de los helados preparados en casa es la <b>cristalización</b>: el agua libre se congela formando cristales duros que arruinan la textura. En este manual aprenderás a equilibrar grasa láctea y azúcares para que tu helado se mantenga suave, sedoso y fácil de servir con cuchara directamente del congelador a -18°C."},
        {"type": "card", "title": "La Regla de los 3 Elementos Base", "text": "<b>1. Grasa Láctea (Mínimo 32% - 35%):</b> Aporta untuosidad y encapsula microburbujas de aire al batir.<br/><b>2. Sólidos Lácteos y Azúcares:</b> La leche condensada desciende el punto de congelación, impidiendo que el agua se petrifique.<br/><b>3. Estabilizante Natural:</b> Una pizca de sal marina resalta los sabores y relaja la red molecular del frío."},
        
        {"type": "h1", "text": "2. La Crema Base Universal (Rinde 1 Litro)"},
        {"type": "p", "text": "Esta es la base maestra. Una vez la tengas lista, puedes transformarla en más de 40 sabores gourmet añadiendo mermeladas, arequipe, cacao o extractos."},
        {"type": "bullet", "text": "<b>500 ml de Crema de Leche para batir</b> (materia grasa mínima 35%, muy fría, mínimo 8 horas en nevera)."},
        {"type": "bullet", "text": "<b>390 g (1 lata) de Leche Condensada</b> entera de alta densidad."},
        {"type": "bullet", "text": "<b>1 cucharadita (5 ml) de Extracto Puro de Vainilla</b>."},
        {"type": "bullet", "text": "<b>1 g (pizca) de Sal Marina fina</b>."},
        
        {"type": "h2", "text": "Paso a Paso de Preparación:"},
        {"type": "bullet", "text": "<b>Paso 1:</b> Enfría el tazón y las aspas de tu batidora en el congelador durante 15 minutos."},
        {"type": "bullet", "text": "<b>Paso 2:</b> Bate la crema fría a velocidad media hasta lograr picos suaves (unos 3-4 minutos). No sobrebatas para no hacer mantequilla."},
        {"type": "bullet", "text": "<b>Paso 3:</b> Añade la leche condensada en hilo continuo, mezclando con espátula de silicona en movimientos circulares de abajo hacia arriba."},
        {"type": "bullet", "text": "<b>Paso 4:</b> Incorpora el saborizante deseado y vierte en recipientes herméticos."},
        {"type": "bullet", "text": "<b>Paso 5:</b> Coloca papel film transparente pegado a la superficie del helado (a piel) y congela mínimo 6 horas."},

        {"type": "break"},

        {"type": "h1", "text": "3. Catálogo de Sabores Más Vendidos"},
        {"type": "h2", "text": "🍨 1. Arequipe Colombiano con Veteado Doble (Top #1 en Ventas)"},
        {"type": "p", "text": "Agrega 200 g de arequipe suave disuelto en la leche condensada antes de integrar a la crema. Al momento de verter en el envase final, intercala cucharadas de arequipe espeso y dibuja vetas con la punta de un cuchillo. Cada porción servida tendrá vetas doradas visibles."},
        
        {"type": "h2", "text": "🍫 2. Chocolate Profundo con Ganache"},
        {"type": "p", "text": "Tamiza 50 g de cacao puro amargo en polvo (100% sin azúcar) sobre la leche condensada y une a la base. Vetea con 100 g de chocolate semi-amargo derretido y tibio con chispas."},
        
        {"type": "h2", "text": "🍓 3. Cheesecake Silvestre de Frutos Rojos"},
        {"type": "p", "text": "Sustituye 150 ml de crema de leche por 150 g de queso crema suave batido. Realiza una reducción casera de moras y fresas campesinas con azúcar y vetea con galletas trituradas."},
        
        {"type": "h2", "text": "☕ 4. Café Moca Cremoso"},
        {"type": "p", "text": "Disuelve 2 cucharadas soperas de café liofilizado en 20 ml de agua hirviendo. Deja enfriar e incorpora a la crema base. El café aporta un amargor balanceado que enamora a los adultos."},

        {"type": "h2", "text": "🍋 5. Paletas Artesanales de Maracuyá Rellenas de Leche Condensada"},
        {"type": "p", "text": "Licúa 350 ml de pulpa de maracuyá con 300 ml de agua y 120 g de azúcar. Vierte en moldes de paleta hasta 3/4. Congela 2 horas con un vasito en el centro, retira el vasito, rellena el centro con leche condensada espesa helada y completa el sellado con más pulpa."}
    ]
)

# 2. POSTRES EN VASO
create_pdf(
    "02_Postres_en_Vaso_Para_Emprender.pdf",
    "Postres en Vaso Para Emprender",
    "Formatos individuales sin horno, técnicas de capas que no se mezclan y recetas de alta rotación comercial.",
    [
        {"type": "h1", "text": "1. Por Qué el Formato en Vaso es el Más Rentable"},
        {"type": "p", "text": "El postre individual en vaso transparente de 5 oz a 7 oz PET elimina las mermas por cortes irregulares, permite congelación y refrigeración limpia, y luce los colores vivos de las capas logrando que el producto se venda solo en fotos de WhatsApp e Instagram."},
        {"type": "card", "title": "Unit Economics del Vaso de 7 oz", "text": "<b>Costo de ingredientes:</b> $1.350 COP<br/><b>Costo de vaso PET + tapa domo + sticker + cuchara:</b> $500 COP<br/><b>Costo Total:</b> $1.850 COP | <b>Precio Venta Sugerido:</b> $6.500 COP<br/><b>Ganancia neta limpia por vaso:</b> $4.650 COP (71% de margen neto)."},

        {"type": "h1", "text": "2. Receta Estrella: Postre Tres Leches en Vaso"},
        {"type": "p", "text": "<b>El Bizcochuelo Base Rápido:</b> Bate 4 huevos con 120 g de azúcar durante 8 minutos hasta que tripliquen volumen. Incorpora 120 g de harina pastelera cernida con espátula de forma suave. Hornea 15 min a 180°C en bandeja plana o en sartén gruesa tapada a fuego mínimo. Trocea en dados."},
        {"type": "p", "text": "<b>La Mezcla Tres Leches:</b> Licúa 1 lata de leche condensada (395 g), 1 lata de leche evaporada (380 g) y 1 taza de crema de leche espesa (250 ml) con una cucharada de brandy o vainilla."},
        {"type": "bullet", "text": "<b>Capa 1:</b> Dados de bizcocho en el fondo del vaso de 7 oz."},
        {"type": "bullet", "text": "<b>Remojo:</b> Baña generosamente con 3 cucharadas de mezcla tres leches hasta empapar por completo."},
        {"type": "bullet", "text": "<b>Capa 2:</b> Capa de crema chantilly batida firme."},
        {"type": "bullet", "text": "<b>Capa 3:</b> Segunda capa fina de bizcocho bien bañado."},
        {"type": "bullet", "text": "<b>Topping:</b> Copo de chantilly con duya 1M y espolvoreado de canela molida fina o cereza marrasquino."},

        {"type": "break"},

        {"type": "h1", "text": "3. Fórmulas Frías Sin Horno"},
        {"type": "h2", "text": "🍋 Pay de Limón Cítrico Sin Gelatina (Espesa en 5 minutos)"},
        {"type": "p", "text": "Licúa 1 lata de leche condensada con 1 taza de crema de leche. Añade en hilo fino 110 ml de zumo de limón recién exprimido y colado. La acidez coagula la leche creando una crema sedosa y firme sin necesidad de gelatina ni calor. Arma con base de galletas Ducales molidas con mantequilla y decora con ralladura fresca."},

        {"type": "h2", "text": "☕ Tiramisú Fácil al Café"},
        {"type": "p", "text": "Bate 250 g de queso crema suave con 70 g de azúcar glass y 200 ml de crema montada. Pasa galletas de huevo 1 segundo por café expreso amargo, coloca en el fondo, cubre con crema de queso y repite. Corona con cacao amargo 100% tamizado."},

        {"type": "h2", "text": "🍓 Fresas con Crema Gourmet Estilo Medellín"},
        {"type": "p", "text": "Bate 1 taza de crema de leche, media lata de leche condensada y 3 cucharadas de leche en polvo (el secreto de espesor de los puestos callejeros gourmet). Intercala capas de fresas frescas desinfectadas con crema, lluvia de barquillos crocantes y leche condensada."}
    ]
)

# 3. DIRECTORIO PROVEEDORES
create_pdf(
    "Bono_02_Directorio_Proveedores_Colombia.pdf",
    "Directorio Secreto de Proveedores Mayoristas",
    "Dónde compran las grandes reposterías en Colombia para ahorrar un 40% en empaques, lácteos y materias primas.",
    [
        {"type": "h1", "text": "1. Envases Plásticos PET y Tapas Domo"},
        {"type": "p", "text": "Comprar vasos individuales en el supermercado te cuesta $600 COP por unidad. Comprando la caja por 500 o 1.000 unidades en distribuidores mayoristas te sale a $280 - $350 COP con tapa domo incluida."},
        {"type": "bullet", "text": "<b>Medellín:</b> Sector Guayaquil (Cll 45 con Cra 53) y Bloque de Abarrotes en la Central Mayorista de Itagüí. Locales recomendados: Plásticos El Punto y Darnel Institucional."},
        {"type": "bullet", "text": "<b>Bogotá:</b> Plaza de Paloquemao (Cra 22 con Cll 19) y sector San Victorino (Cra 10 entre Calles 10 y 13). Más de 30 bodegas con venta de empaques por mayor."},
        {"type": "bullet", "text": "<b>Cali:</b> Sector El Calvario y Galería Santa Elena. Precios directos de fábrica en termoformados."},

        {"type": "h1", "text": "2. Lácteos y Chocolates al Por Mayor"},
        {"type": "bullet", "text": "<b>Cremas Vegetales para Batir (Tipo Chantilly):</b> Marcas Ambiante (Puratos) o Rich's Bettercreme. Vienen en cajas de 1 litro, rinden el doble que la crema de leche animal y no se derriten con el calor del ambiente."},
        {"type": "bullet", "text": "<b>Arequipe en Balde (5 kg / 10 kg):</b> Marcas San Fernando o Alpina Repostero. Comprar el balde reduce el costo del kilo de arequipe de $18.000 COP a $9.500 COP."},

        {"type": "h1", "text": "3. Stickers Adhesivos para Nevera"},
        {"type": "card", "title": "El Secreto del Material", "text": "Nunca mandes a imprimir en papel adhesivo común porque la condensación de la nevera lo humedece y lo rompe. Pide siempre <b>Vinilo Adhesivo Laminado o Propalcote con barniz UV</b>. Resiste agua, congelación y manipulación."}
    ]
)

# 4. GUÍA VENTAS WHATSAPP
create_pdf(
    "Bono_03_Guia_Ventas_WhatsApp_Postres.pdf",
    "Cómo Vender 100 Vasos de Postre a la Semana",
    "Estrategia de ventas orgánicas por estados de WhatsApp y pedidos corporativos sin pagar publicidad.",
    [
        {"type": "h1", "text": "1. El Método de la 'Caja Mixta de Fin de Semana'"},
        {"type": "p", "text": "No vendas vasos sueltos. El domicilio o la entrega de un solo vaso de $6.500 COP te quita tiempo y margen. Vende siempre <b>Cajas de 4 o 6 Unidades Surtidas</b>."},
        {"type": "bullet", "text": "<b>La Caja Degustación (4 vasos):</b> 1 Tres Leches + 1 Pay de Limón + 1 Tiramisú + 1 Frutos Rojos."},
        {"type": "bullet", "text": "<b>Precio unitario individual:</b> $7.000 COP c/u ($28.000 los 4)."},
        {"type": "bullet", "text": "<b>Precio especial en Caja Mixta:</b> <b>$22.000 COP</b>."},

        {"type": "h1", "text": "2. Cronograma de Estados de WhatsApp"},
        {"type": "p", "text": "<b>Jueves 5:00 PM (Creación de Deseo):</b> Publica una foto o video corto en primer plano decorando los vasos con la manga pastelera. Texto: <i>'¡Se viene fin de semana dulce! 🍓✨ Mañana sacamos tanda limitada de vasitos 3 Leches y Pay de Maracuyá. Solo 20 cajas disponibles. Aparta la tuya por aquí antes de que se agoten 👇'</i>."},
        {"type": "p", "text": "<b>Viernes 11:30 AM (Gatillo del Almuerzo):</b> Foto de la caja abierta con las cucharas y etiquetas. Texto: <i>'¡Listas las cajas de hoy! 🔥 Quedan únicamente 6 disponibles para entregar después de almuerzo. ¿Quién dijo yo? Escríbeme y te la aparto 🛵💨'</i>."},

        {"type": "h1", "text": "3. Clientes en Oficinas y Empresas"},
        {"type": "p", "text": "Un solo conocido que trabaje en un banco, call center o empresa puede comprarte entre 15 y 30 vasitos todos los viernes para la hora del café. Ofrécele una caja de degustación gratuita para que la comparta con su equipo y recoge los pedidos fijos semanales."}
    ]
)

# 5. REMEDIOS NATURALES
create_pdf(
    "03_Remedios_Naturales_Ancestrales_Salud.pdf",
    "El Gran Libro de los Remedios Naturales Ancestrales",
    "Fórmulas terapéuticas naturales para regular glucosa, presión arterial, gastritis y cocina en Airfryer.",
    [
        {"type": "h1", "text": "1. Protocolo Natural Para Regular la Glucosa y Diabetes"},
        {"type": "p", "text": "<b>Infusión de Canela Ceilán y Laurel:</b> La canela de Ceilán contiene polifenoles activos que sensibilizan los receptores celulares a la insulina. Hierve 1 rama de canela con 2 hojas secas de laurel en 350 ml de agua durante 5 minutos. Toma 1 taza tibia 20 minutos antes del desayuno."},
        {"type": "p", "text": "<b>El Tónico de Vinagre de Sidra de Manzana con La Madre:</b> 1 cucharada sopera en 200 ml de agua tibia antes de las comidas ricas en carbohidratos reduce el pico glucémico posprandial hasta en un 30% según estudios clínicos."},

        {"type": "h1", "text": "2. Remedios Para Presión Arterial y Gastritis"},
        {"type": "bullet", "text": "<b>Presión Arterial:</b> Maceración en frío de flor de Jamaica (hibisco) con 1 diente de ajo negro. Actúa como vasodilatador natural y protector endotelial."},
        {"type": "bullet", "text": "<b>Gastritis y Reflujo:</b> Jugo de papa cruda pastusa rallada y colada mezclado con cristal puro de sábila (aloe vera bien lavado para retirar aloína). Crea una capa protectora alcalina sobre la mucosa gástrica."},

        {"type": "h1", "text": "3. Cocina Saludable en Air Fryer"},
        {"type": "p", "text": "Aprende a preparar vegetales crocantes con cúrcuma y pimienta negra a 180°C durante 12 minutos, y pechugas marinadas en finas hierbas a 195°C durante 16 minutos, conservando el 90% de sus nutrientes sin añadir aceites refinados dañinos."}
    ]
)

print("✨ TODOS LOS 5 DOCUMENTOS PDF GENERADOS CON ÉXITO.")
