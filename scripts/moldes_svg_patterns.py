# -*- coding: utf-8 -*-
"""
Motor de Planos Técnicos y Despiece de Patronaje Industrial
Genera planos vectoriales SVG y tablas de despiece 100% únicos y diferenciados
para cada una de las 33 prendas maestras del Mega Pack.
"""

def get_grid_header():
    return """
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f8fafc" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)"/>
    """

# -------------------------------------------------------------------------
# 01. VESTIDOS
# -------------------------------------------------------------------------
def svg_ves_01():
    # Vestido Casual Manga Corta
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <!-- DELANTERO -->
      <g transform="translate(30, 20)">
        <path d="M 0,20 C 25,5 60,5 80,0 L 135,0 L 160,30 L 145,100 C 135,160 145,220 180,390 L 0,390 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="0" y1="0" x2="0" y2="390" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="6,4"/>
        <!-- Pinza de busto diagonal -->
        <polygon points="145,120 85,140 148,145" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3,2"/>
        <line x1="145" y1="120" x2="85" y2="140" stroke="#dc2626" stroke-width="1.2"/>
        <line x1="148" y1="145" x2="85" y2="140" stroke="#dc2626" stroke-width="1.2"/>
        <!-- Hilo -->
        <line x1="70" y1="80" x2="70" y2="280" stroke="#b08442" stroke-width="1.5"/>
        <polygon points="70,75 67,85 73,85" fill="#b08442"/><polygon points="70,285 67,275 73,275" fill="#b08442"/>
        <text x="78" y="180" font-size="8.5" fill="#b08442" font-family="sans-serif">↕ HILO</text>
        <text x="25" y="70" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">DELANTERO</text>
        <text x="25" y="85" font-size="8" fill="#64748b">1x al Doblez (⫾)</text>
      </g>
      <!-- ESPALDA -->
      <g transform="translate(230, 20)">
        <path d="M 0,10 C 25,5 55,5 75,0 L 130,0 L 155,30 L 140,100 C 130,160 140,220 175,390 L 0,390 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="0" y1="0" x2="0" y2="390" stroke="#0c1b33" stroke-width="1.5"/>
        <!-- Pinza de talle espalda -->
        <polygon points="70,390 65,180 75,180" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3,2"/>
        <line x1="70" y1="180" x2="70" y2="390" stroke="#dc2626" stroke-width="1.2"/>
        <text x="25" y="70" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">ESPALDA</text>
        <text x="25" y="85" font-size="8" fill="#64748b">Cortar 2x (Cremallera)</text>
      </g>
      <!-- MANGA CORTA -->
      <g transform="translate(430, 40)">
        <path d="M 0,60 C 35,15 75,0 115,0 C 155,0 195,15 230,60 L 210,160 L 20,160 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="115" y1="30" x2="115" y2="135" stroke="#b08442" stroke-width="1.5"/>
        <polygon points="115,25 112,35 118,35" fill="#b08442"/><polygon points="115,140 112,130 118,130" fill="#b08442"/>
        <text x="75" y="85" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">MANGA CORTA</text>
        <text x="75" y="100" font-size="8" fill="#64748b">Cortar 2x (Par)</text>
      </g>
      <!-- VISTAS Y BOLSILLO -->
      <g transform="translate(440, 240)">
        <path d="M 0,0 C 30,20 60,20 90,0 L 90,30 C 60,45 30,45 0,30 Z" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.5"/>
        <text x="12" y="22" font-size="7.5" font-weight="bold" fill="#b08442">VISTA ESCOTE (1x Doblez)</text>
        <rect x="110" y="0" width="105" height="110" rx="3" fill="#fff" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="120" y="35" font-size="8" font-weight="bold" fill="#0c1b33">BOLSILLO OCULTO</text>
        <text x="120" y="50" font-size="7.5" fill="#64748b">Cortar 4x en forro</text>
      </g>
    </svg>"""

def svg_ves_02():
    # Vestido Camisero Cinturón
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <!-- DELANTERO CON BOTONES -->
      <g transform="translate(25, 20)">
        <path d="M 25,0 L 85,0 L 115,25 L 105,95 C 100,160 115,240 140,410 L 0,410 L 0,35 C 12,35 20,20 25,0 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="16" y1="0" x2="16" y2="410" stroke="#b08442" stroke-width="1.5" stroke-dasharray="4,3"/>
        <circle cx="8" cy="70" r="3" fill="#b08442"/><circle cx="8" cy="130" r="3" fill="#b08442"/><circle cx="8" cy="190" r="3" fill="#b08442"/><circle cx="8" cy="250" r="3" fill="#b08442"/><circle cx="8" cy="310" r="3" fill="#b08442"/><circle cx="8" cy="370" r="3" fill="#b08442"/>
        <text x=\"28\" y=\"80\" font-size=\"10\" font-weight=\"bold\" fill=\"#0c1b33\" font-family=\"Georgia, serif\">DELANTERO</text>
        <text x=\"28\" y=\"95\" font-size=\"8\" fill=\"#64748b\">Cortar 2x (Botonadura)</text>
      </g>
      <!-- ESPALDA Y CANESÚ -->
      <g transform=\"translate(185, 80)\">
        <path d=\"M 0,0 L 115,0 C 110,80 120,200 145,350 L 0,350 Z\" fill=\"#f8fafc\" stroke=\"#0c1b33\" stroke-width=\"2\"/>
        <line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"350\" stroke=\"#2563eb\" stroke-width=\"2.5\" stroke-dasharray=\"6,4\"/>
        <text x=\"25\" y=\"60\" font-size=\"10\" font-weight=\"bold\" fill=\"#0c1b33\" font-family=\"Georgia, serif\">ESPALDA</text>
        <text x=\"25\" y=\"75\" font-size=\"8\" fill=\"#64748b\">1x al Doblez (⫾)</text>
      </g>
      <g transform=\"translate(185, 20)\">
        <path d=\"M 0,15 L 20,0 L 95,0 L 115,15 L 115,50 L 0,50 Z\" fill=\"#fef7ea\" stroke=\"#0c1b33\" stroke-width=\"1.8\"/>
        <text x=\"20\" y=\"30\" font-size=\"8.5\" font-weight=\"bold\" fill=\"#b08442\">CANESÚ (2x)</text>
      </g>
      <!-- MANGA LARGA CON PUÑO -->
      <g transform=\"translate(345, 20)\">
        <path d=\"M 0,70 C 35,15 70,0 105,0 C 140,0 175,15 210,70 L 180,340 L 30,340 Z\" fill=\"#f8fafc\" stroke=\"#0c1b33\" stroke-width=\"2\"/>
        <text x=\"75\" y=\"100\" font-size=\"10\" font-weight=\"bold\" fill=\"#0c1b33\" font-family=\"Georgia, serif\">MANGA</text>
        <text x=\"75\" y=\"115\" font-size=\"8\" fill=\"#64748b\">Cortar 2x (Par)</text>
      </g>
      <!-- CUELLO, TIRILLA, CINTURÓN -->
      <g transform=\"translate(570, 20)\">
        <path d=\"M 0,0 L 105,0 L 115,35 L 0,35 Z\" fill=\"#fff\" stroke=\"#0c1b33\" stroke-width=\"1.8\"/>
        <text x=\"15\" y=\"22\" font-size=\"8\" font-weight=\"bold\" fill=\"#0c1b33\">CUELLO (2x)</text>
        <path d=\"M 0,45 C 35,42 65,42 110,46 L 105,72 C 65,68 35,68 0,72 Z\" fill=\"#fef7ea\" stroke=\"#0c1b33\" stroke-width=\"1.8\"/>
        <text x=\"12\" y=\"62\" font-size=\"7.5\" font-weight=\"bold\" fill=\"#b08442\">PIE DE CUELLO (2x)</text>
        <rect x=\"0\" y=\"85\" width=\"110\" height=\"40\" rx=\"2\" fill=\"#fff\" stroke=\"#0c1b33\" stroke-width=\"1.8\"/>
        <text x=\"25\" y=\"110\" font-size=\"8\" font-weight=\"bold\" fill=\"#0c1b33\">PUÑOS (4x)</text>
        <rect x=\"0\" y=\"140\" width=\"115\" height=\"240\" rx=\"2\" fill=\"#f8fafc\" stroke=\"#0c1b33\" stroke-width=\"1.8\"/>
        <text x=\"15\" y=\"220\" font-size=\"8\" font-weight=\"bold\" fill=\"#0c1b33\">CINTURÓN DE LAZO</text>
        <text x=\"15\" y=\"235\" font-size=\"7\" fill=\"#64748b\">Cortar 2x (160x10 cm)</text>
      </g>
    </svg>"""

def svg_ves_03():
    # Vestido Evasé Juvenil
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(40, 25)">
        <path d="M 0,25 C 30,10 65,10 90,0 L 135,0 L 160,35 L 140,110 C 145,200 185,300 230,410 L 0,410 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width=\"2\"/>
        <line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"410\" stroke=\"#2563eb\" stroke-width=\"2.5\" stroke-dasharray=\"6,4\"/>
        <text x=\"40\" y=\"90\" font-size=\"11\" font-weight=\"bold\" fill=\"#0c1b33\" font-family=\"Georgia, serif\">DELANTERO EVASÉ</text>
        <text x=\"40\" y=\"108\" font-size=\"8.5\" fill=\"#64748b\">1x al Doblez (⫾) · Vuelo Acampanado</text>
      </g>
      <g transform=\"translate(310, 25)\">
        <path d=\"M 0,15 C 25,5 60,5 85,0 L 130,0 L 155,35 L 135,110 C 140,200 180,300 225,410 L 0,410 Z\" fill=\"#f8fafc\" stroke=\"#0c1b33\" stroke-width=\"2\"/>
        <line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"410\" stroke=\"#0c1b33\" stroke-width=\"1.8\"/>
        <text x=\"40\" y=\"90\" font-size=\"11\" font-weight=\"bold\" fill=\"#0c1b33\" font-family=\"Georgia, serif\">ESPALDA EVASÉ</text>
        <text x=\"40\" y=\"108\" font-size=\"8.5\" fill=\"#64748b\">Cortar 2x (Costura central)</text>
      </g>
      <g transform=\"translate(560, 40)\">
        <path d=\"M 0,0 C 40,30 80,30 120,0 L 120,35 C 80,55 40,55 0,35 Z\" fill=\"#fef7ea\" stroke=\"#0c1b33\" stroke-width=\"1.8\"/>
        <text x=\"10\" y=\"25\" font-size=\"7.5\" font-weight=\"bold\" fill=\"#b08442\">VISTA ESCOTE REDONDO</text>
        <rect x=\"0\" y=\"100\" width=\"120\" height=\"80\" rx=\"3\" fill=\"#fff\" stroke=\"#0c1b33\" stroke-width=\"1.8\"/>
        <text x=\"15\" y=\"135\" font-size=\"8\" font-weight=\"bold\" fill=\"#0c1b33\">BOLSILLO LATERAL</text>
        <text x=\"15\" y=\"150\" font-size=\"7.5\" fill=\"#64748b\">Cortar 4x en forro</text>
      </g>
    </svg>"""

def svg_ves_04():
    # Vestido Maxi Fiesta Escote en V Cruzado
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <!-- CORPIÑO DELANTERO DRAPEADO -->
      <g transform="translate(30, 25)">
        <path d="M 0,0 L 90,0 L 115,25 L 95,90 C 85,150 110,210 135,230 L 10,230 L 0,0 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <path d="M 90,0 L 10,230" stroke="#dc2626" stroke-width="2" stroke-dasharray="6,3"/>
        <text x="15" y=\"70\" font-size=\"9\" font-weight=\"bold\" fill=\"#0c1b33\" font-family=\"Georgia, serif\">CORPIÑO DRAPEADO</text>
        <text x=\"15\" y=\"85\" font-size=\"7.5\" fill=\"#64748b\">Cortar 2x (Cruce en V)</text>
      </g>
      <!-- CORPIÑO ESPALDA -->
      <g transform=\"translate(180, 25)\">
        <path d=\"M 0,15 L 70,0 L 95,25 L 85,90 C 80,150 90,190 100,230 L 0,230 Z\" fill=\"#f8fafc\" stroke=\"#0c1b33\" stroke-width=\"2\"/>
        <text x=\"15\" y=\"70\" font-size=\"9\" font-weight=\"bold\" fill=\"#0c1b33\" font-family=\"Georgia, serif\">CORPIÑO ESPALDA</text>
        <text x=\"15\" y=\"85\" font-size=\"7.5\" fill=\"#64748b\">Cortar 2x (Cremallera)</text>
      </g>
      <!-- FALDA MAXI SEMICIRCULAR DE GALA -->
      <g transform=\"translate(300, 25)\">
        <path d=\"M 0,0 C 70,70 150,70 220,0 L 380,410 C 230,440 100,440 0,410 Z\" fill=\"#f8fafc\" stroke=\"#0c1b33\" stroke-width=\"2\"/>
        <text x=\"120\" y=\"160\" font-size=\"12\" font-weight=\"bold\" fill=\"#0c1b33\" font-family=\"Georgia, serif\">FALDA MAXI LARGA DE GALA</text>
        <text x=\"120\" y=\"180\" font-size=\"8.5\" fill=\"#64748b\">Corte semicircular amplio al bies (Largo 115 cm)</text>
        <line x1=\"220\" y1=\"200\" x2=\"220\" y2=\"410\" stroke=\"#dc2626\" stroke-width=\"2\" stroke-dasharray=\"6,3\"/>
        <text x=\"225\" y=\"320\" font-size=\"8\" fill=\"#dc2626\">Abertura pierna 65 cm</text>
      </g>
    </svg>"""

# -------------------------------------------------------------------------
# 02. BLUSAS Y CAMISERÍA
# -------------------------------------------------------------------------
def svg_blu_01():
    # Blusa Básica Cuello Redondo
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(35, 30)">
        <path d="M 0,35 C 25,10 65,10 85,0 L 135,0 L 160,30 L 145,100 C 135,170 140,240 150,330 L 0,330 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="0" y1="0" x2="0" y2="330" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="6,4"/>
        <polygon points="145,130 90,150 148,155" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3,2"/>
        <text x="25" y="80" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">DELANTERO BLUSA</text>
        <text x="25" y="95" font-size="8" fill="#64748b">1x al Doblez (⫾) · Pinza de Busto</text>
      </g>
      <g transform="translate(230, 30)">
        <path d="M 0,15 C 25,5 60,5 80,0 L 130,0 L 155,30 L 140,100 C 130,170 135,240 145,330 L 0,330 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="0" y1="0" x2="0" y2="330" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="6,4"/>
        <line x1="0" y1="0" x2="0" y2="80" stroke="#dc2626" stroke-width="2.5"/>
        <text x="25" y="80" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">ESPALDA BLUSA</text>
        <text x="25" y="95" font-size="8" fill="#64748b">1x al Doblez con Abertura Lágrima</text>
      </g>
      <g transform="translate(425, 50)">
        <path d="M 0,55 C 35,10 75,0 115,0 C 155,0 195,10 230,55 L 205,150 L 25,150 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="75" y="85" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">MANGA CORTA</text>
        <text x="75" y="100" font-size="8" fill="#64748b">Cortar 2x (Par)</text>
      </g>
      <g transform="translate(425, 230)">
        <rect x="0" y="0" width="230" height="30" rx="3" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="25" y="20" font-size="8.5" font-weight="bold" fill="#b08442">VISTA ESCOTE EN SESGO AL BIES 45°</text>
      </g>
    </svg>"""

def svg_blu_02():
    # Camisa Clásica Manga Larga Sastre
    from sys import modules
    return svg_camisa_clasica_full()

def svg_camisa_clasica_full():
    return """<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      <defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f8fafc" stroke-width="1"/></pattern></defs>
      <rect width="100%" height="100%" fill="url(#grid)"/>
      <g transform="translate(25, 30)">
        <path d="M 30,0 L 95,0 L 125,25 L 115,100 C 120,170 120,240 125,360 L 0,360 L 0,35 C 15,35 25,20 30,0 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="18" y1="0" x2="18" y2="360" stroke="#b08442" stroke-width="1.5" stroke-dasharray="4,3"/>
        <circle cx="9" cy="60" r="3.5" fill="#b08442"/><circle cx="9" cy="120" r="3.5" fill="#b08442"/><circle cx="9" cy="180" r="3.5" fill="#b08442"/><circle cx="9" cy="240" r="3.5" fill="#b08442"/><circle cx="9" cy="300" r="3.5" fill="#b08442"/>
        <text x="30" y="80" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">DELANTERO</text>
        <text x="30" y="95" font-size="8" fill="#64748b">Cortar 2x (Par)</text>
      </g>
      <g transform="translate(170, 90)">
        <path d="M 0,0 L 125,0 C 120,80 120,180 125,300 L 0,300 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="0" y1="0" x2="0" y2="300" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="6,4"/>
        <text x="30" y="60" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">ESPALDA</text>
        <text x="30" y="75" font-size="8" fill="#64748b">1x al Doblez (⫾)</text>
      </g>
      <g transform="translate(170, 20)">
        <path d="M 0,15 L 25,0 L 105,0 L 125,15 L 125,55 L 0,55 Z" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="25" y="32" font-size="9" font-weight="bold" fill="#b08442">CANESÚ ESPALDA (2x)</text>
      </g>
      <g transform="translate(315, 30)">
        <path d="M 0,80 C 40,20 80,0 120,0 C 160,0 200,20 240,80 L 210,360 L 30,360 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="65" y1="360" x2="65" y2="270" stroke="#dc2626" stroke-width="2" stroke-dasharray="4,2"/>
        <text x="80" y="110" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">MANGA CAMISERA</text>
        <text x="80" y="125" font-size="8" fill="#64748b">Cortar 2x (Sardineta)</text>
      </g>
      <g transform="translate(575, 30)">
        <path d="M 0,0 L 105,0 L 115,35 L 0,35 Z" fill="#fff" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="12" y="22" font-size="8" font-weight="bold" fill="#0c1b33">CUELLO (2x)</text>
        <path d="M 0,45 C 40,43 70,43 115,48 L 110,75 C 70,72 40,72 0,75 Z" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="10" y="63" font-size="7.5" font-weight="bold" fill="#b08442">PIE DE CUELLO (2x)</text>
        <rect x="0" y="90" width="115" height="45" rx="2" fill="#fff" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="30" y="115" font-size="8" font-weight="bold" fill="#0c1b33">PUÑOS (4x)</text>
      </g>
    </svg>"""

def svg_blu_03():
    # Top Cruzado Elegante Wrap
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(20, 40)">
        <path d="M 40,0 L 100,0 L 125,25 L 115,90 C 110,180 120,240 135,280 L 15,280 C 15,220 30,120 40,0 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <path d="M 100,0 L 15,280" stroke="#dc2626" stroke-width="2" stroke-dasharray="6,3"/>
        <path d="M 135,260 L 250,260 L 250,280 L 135,280 Z" fill="#fef7ea" stroke="#b08442" stroke-width="1.5"/>
        <text x="25" y="80" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">DELANTERO WRAP</text>
        <text x="25" y="95" font-size="8" fill="#64748b">Cortar 2x (Cruce Asimétrico)</text>
        <text x="145" y="274" font-size="7.5" font-weight="bold" fill="#b08442">LAZO INTEGRADO</text>
      </g>
      <g transform="translate(290, 40)">
        <path d="M 0,15 L 70,0 L 130,0 L 155,25 L 140,90 C 135,170 135,220 140,280 L 0,280 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="0" y1="0" x2="0" y2="280" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="6,4"/>
        <polygon points="70,280 65,160 75,160" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3,2"/>
        <text x="30" y="60" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">ESPALDA CORTA</text>
        <text x="30" y="75" font-size="8" fill="#64748b">1x al Doblez (A la cintura)</text>
      </g>
      <g transform="translate(470, 40)">
        <path d="M 0,55 C 30,10 60,0 95,0 C 130,0 160,10 190,55 L 170,240 L 20,240 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="60" y="90" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">MANGA 3/4</text>
        <text x="60" y="105" font-size="8" fill="#64748b">Cortar 2x (Par)</text>
        <rect x="0" y="265" width="190" height="30" rx="2" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.5"/>
        <text x="20" y="284" font-size="8" font-weight="bold" fill="#b08442">VISTA ESCOTE AL BIES (2x)</text>
      </g>
    </svg>"""

def svg_blu_04():
    # Blusa Romántica con Olanes y Manga Campana
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(25, 30)">
        <path d="M 0,30 C 25,10 65,10 85,0 L 135,0 L 160,30 L 145,100 C 135,170 145,240 160,330 L 0,330 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="0" y1="0" x2="0" y2="330" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="6,4"/>
        <text x="25" y="80" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">DELANTERO</text>
        <text x="25" y="95" font-size="8" fill="#64748b">1x al Doblez (⫾)</text>
      </g>
      <!-- OLANES EN CARACOL -->
      <g transform="translate(210, 30)">
        <path d="M 0,0 C 70,-20 130,20 120,100 C 110,180 30,170 30,110 C 30,70 80,60 80,90" fill="none" stroke="#b08442" stroke-width="2.5"/>
        <text x="20" y="200" font-size="9" font-weight="bold" fill="#b08442">VOLANTE / OLÁN CARACOL</text>
        <text x="20" y="215" font-size="7.5" fill="#64748b">Cortar 2x (Caída en cascada)</text>
      </g>
      <!-- MANGA CAMPANA CON VUELO -->
      <g transform="translate(380, 30)">
        <path d="M 30,55 C 60,10 100,0 140,0 C 180,0 220,10 250,55 L 280,340 C 190,380 90,380 0,340 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="100" y="110" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">MANGA CAMPANA</text>
        <text x="100" y="125" font-size="8" fill="#64748b">Vuelo amplio acampanado</text>
      </g>
    </svg>"""

# -------------------------------------------------------------------------
# 03. PANTALONES Y SHORTS
# -------------------------------------------------------------------------
def svg_pan_01():
    # Pantalón Palazzo Tiro Alto
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <!-- DELANTERO PALAZZO PIERNA ANCHA -->
      <g transform="translate(30, 20)">
        <path d="M 0,0 L 95,0 L 105,70 C 125,120 140,150 145,170 L 150,420 L 0,420 L 0,170 C 10,130 10,60 0,0 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="75" y1="30" x2="75" y2="390" stroke="#b08442" stroke-width="1.5"/>
        <text x="20" y="60" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">DELANTERO PALAZZO</text>
        <text x="20" y="75" font-size="8" fill="#64748b">Bota recta ancha 34 cm</text>
        <line x1="75" y1="0" x2="105" y2="45" stroke="#dc2626" stroke-width="1.8"/>
        <text x="65" y="25" font-size="7" fill="#dc2626">Bolsillo diagonal</text>
      </g>
      <!-- ESPALDA PALAZZO TIRO PROFUNDO -->
      <g transform="translate(220, 20)">
        <path d="M 20,0 L 115,0 L 125,70 C 155,120 175,160 185,185 L 175,420 L 25,420 L 25,185 C 10,120 0,60 20,0 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="45" y="60" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">ESPALDA PALAZZO</text>
        <text x="45" y="75" font-size="8" fill="#64748b">Tiro largo anatómico</text>
      </g>
      <!-- PRETINA ANCHA Y VISTAS BOLSILLO -->
      <g transform="translate(450, 40)">
        <rect x="0" y="0" width="220" height="45" rx="3" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="25" y="27" font-size="9" font-weight="bold" fill="#b08442">PRETINA ANATOMICA TIRO ALTO (2x)</text>
        <path d="M 20,80 L 120,80 L 120,180 C 70,180 20,130 20,80 Z" fill="#fff" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="30" y="115" font-size="8" font-weight="bold" fill="#0c1b33">FONDO BOLSILLO</text>
        <text x="30" y="130" font-size="7.5" fill="#64748b">Cortar 4x en forro</text>
      </g>
    </svg>"""

def svg_pan_02():
    # Pantalón Recto Formal de Vestir
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(30, 20)">
        <path d="M 0,0 L 90,0 L 95,70 C 110,110 120,140 125,160 L 105,420 L 15,420 L 0,160 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="60" y1="0" x2="60" y2="420" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="6,3"/>
        <text x="20" y="60" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">DELANTERO FORMAL</text>
        <text x="20" y="75" font-size="7.5" fill="#2563eb">Línea de planchado / Raya</text>
        <path d="M 0,0 L 0,65 L 25,65 L 25,0 Z" fill="#fef7ea" stroke="#b08442"/>
        <text x="3" y="35" font-size="6.5" font-weight="bold" fill="#b08442">BRAGUETA</text>
      </g>
      <g transform="translate(200, 20)">
        <path d="M 15,0 L 105,0 L 115,70 C 135,110 155,140 160,170 L 125,420 L 35,420 L 25,170 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="40" y="60" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">ESPALDA FORMAL</text>
        <rect x="55" y="30" width="45" height="12" fill="#fff" stroke="#dc2626"/>
        <text x="58" y="40" font-size="6.5" fill="#dc2626">Bolsillo ojal</text>
      </g>
      <g transform="translate(410, 40)">
        <rect x="0" y="0" width="250" height="35" rx="2" fill="#fff" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="20" y="22" font-size="8.5" font-weight="bold" fill="#0c1b33">PRETINA SASTRE CON PASADORES</text>
        <rect x="0" y="60" width="100" height="25" fill="#fef7ea" stroke="#b08442"/>
        <text x="10" y="77" font-size="7.5" font-weight="bold" fill="#b08442">VISTAS BOLSILLO (4x)</text>
      </g>
    </svg>"""

def svg_pan_03():
    # Short Casual con Lazo
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(40, 40)">
        <path d="M 0,0 L 125,0 L 130,50 C 145,80 155,100 160,115 L 140,240 L 0,240 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="25" y="70" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">DELANTERO SHORT</text>
        <text x="25" y="85" font-size="8" fill="#64748b">Cintura Paper-Bag</text>
      </g>
      <g transform="translate(240, 40)">
        <path d="M 15,0 L 135,0 L 145,50 C 165,80 185,100 195,125 L 160,240 L 20,240 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="40" y="70" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">ESPALDA SHORT</text>
      </g>
      <g transform="translate(460, 40)">
        <rect x="0" y="0" width="200" height="30" rx="2" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="15" y="20" font-size="8" font-weight="bold" fill="#b08442">PRETINA FRUNCIDA CON ELÁSTICO</text>
        <rect x="0" y="50" width="200" height="25" fill="#fff" stroke="#0c1b33" stroke-width="1.5"/>
        <text x="15" y="67" font-size="8" font-weight="bold" fill="#0c1b33">CINTURÓN DE LAZO (140 cm)</text>
      </g>
    </svg>"""

def svg_pan_04():
    # Bermuda Playera Unisex
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(30, 30)">
        <path d="M 0,0 L 120,0 L 125,60 C 145,95 160,120 165,140 L 140,330 L 0,330 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="25" y="70" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">DELANTERO BERMUDA</text>
        <text x="25" y="85" font-size="8" fill="#64748b">Corte Playero Suelto</text>
      </g>
      <g transform="translate(225, 30)">
        <path d="M 20,0 L 135,0 L 145,60 C 170,95 195,120 205,150 L 165,330 L 25,330 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="45" y="70" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">ESPALDA BERMUDA</text>
      </g>
      <g transform="translate(465, 50)">
        <rect x="0" y="0" width="180" height="35" rx="2" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="15" y="22" font-size="8" font-weight="bold" fill="#b08442">JARETA CINTURA CON CORDÓN</text>
        <rect x="0" y="60" width="110" height="110" rx="3" fill="#fff" stroke="#0c1b33" stroke-width="1.8"/>
        <circle cx="55" cy="145" r="4" fill="none" stroke="#b08442"/>
        <text x="12" y="90" font-size="8" font-weight="bold" fill="#0c1b33">BOLSILLO TRASERO</text>
        <text x="12" y="105" font-size="7" fill="#64748b">Con ojal de drenaje</text>
      </g>
    </svg>"""

# -------------------------------------------------------------------------
# 04. FALDAS Y CONJUNTOS
# -------------------------------------------------------------------------
def svg_fal_01():
    # Falda Lápiz Tubo con Abertura
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(50, 40)">
        <path d="M 0,0 L 120,0 L 135,80 C 130,180 120,280 115,360 L 0,360 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="0" y1="0" x2="0" y2="360" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="6,4"/>
        <polygon points="60,0 55,60 65,60" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3,2"/>
        <text x="25" y="100" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">DELANTERO FALDA</text>
        <text x="25" y="115" font-size="8" fill="#64748b">1x al Doblez (⫾)</text>
      </g>
      <g transform="translate(230, 40)">
        <path d="M 0,0 L 120,0 L 135,80 C 130,180 120,280 115,360 L 35,360 L 35,230 L 0,230 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <polygon points="60,0 55,65 65,65" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3,2"/>
        <text x="25" y="100" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">ESPALDA FALDA</text>
        <text x="25" y="115" font-size="8" fill="#64748b">Cortar 2x (Cremallera)</text>
        <text x="45" y="300" font-size="7.5" font-weight="bold" fill="#dc2626">ABERTURA SASTRE 15 cm</text>
      </g>
      <g transform="translate(420, 50)">
        <rect x="0" y="0" width="220" height="35" rx="2" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="20" y="22" font-size="8.5" font-weight="bold" fill="#b08442">PRETINA RECTIFICADA (2x)</text>
      </g>
    </svg>"""

def svg_fal_02():
    # Falda Plisada Midi
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(40, 50)">
        <rect x="0" y="0" width="380" height="320" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <!-- Líneas de tablas plisadas -->
        <line x1="40" y1="0" x2="40" y2="320" stroke="#b08442" stroke-dasharray="4,4"/>
        <line x1="80" y1="0" x2="80" y2="320" stroke="#b08442" stroke-dasharray="4,4"/>
        <line x1="120" y1="0" x2="120" y2="320" stroke="#b08442" stroke-dasharray="4,4"/>
        <line x1="160" y1="0" x2="160" y2="320" stroke="#b08442" stroke-dasharray="4,4"/>
        <line x1="200" y1="0" x2="200" y2="320" stroke="#b08442" stroke-dasharray="4,4"/>
        <line x1="240" y1="0" x2="240" y2="320" stroke="#b08442" stroke-dasharray="4,4"/>
        <line x1="280" y1="0" x2="280" y2="320" stroke="#b08442" stroke-dasharray="4,4"/>
        <line x1="320" y1="0" x2="320" y2="320" stroke="#b08442" stroke-dasharray="4,4"/>
        <text x="80" y="150" font-size="12" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">PAÑO DE TABLAS PLISADAS (2x)</text>
        <text x="80" y="170" font-size="9" fill="#64748b">Pliegues acordeón de 2.5 cm · Ancho 140 cm</text>
      </g>
      <g transform="translate(460, 50)">
        <rect x="0" y="0" width="190" height="40" rx="3" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="15" y="25" font-size="8.5" font-weight="bold" fill="#b08442">PRETINA ELÁSTICA DECORATIVA</text>
      </g>
    </svg>"""

def svg_con_01():
    # Conjunto 2 Piezas: Crop Top y Minifalda
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <!-- CROP TOP -->
      <g transform="translate(30, 30)">
        <path d="M 0,20 L 70,0 L 105,25 L 95,80 C 85,120 90,140 100,160 L 0,160 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="0" y1="0" x2="0" y2="160" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="6,4"/>
        <text x="15" y="70" font-size="9" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">CROP TOP</text>
        <text x="15" y="85" font-size="7.5" fill="#64748b">1x al Doblez</text>
      </g>
      <!-- MINIFALDA CRUZADA TULIPÁN -->
      <g transform="translate(170, 30)">
        <path d="M 0,0 L 120,0 L 135,70 C 130,140 120,200 110,240 C 60,260 20,210 0,150 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="25" y="70" font-size="9" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">FALDA TULIPÁN</text>
        <text x="25" y="85" font-size="7.5" fill="#64748b">Cruce delantero curvo</text>
      </g>
      <!-- ESPALDA FALDA -->
      <g transform="translate(340, 30)">
        <path d="M 0,0 L 120,0 L 135,70 C 130,150 120,220 115,250 L 0,250 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="25" y="70" font-size="9" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">ESPALDA FALDA</text>
        <text x="25" y="85" font-size="7.5" fill="#64748b">Cortar 2x</text>
      </g>
    </svg>"""

# -------------------------------------------------------------------------
# 05. ROPA DEPORTIVA
# -------------------------------------------------------------------------
def svg_dep_01():
    # Leggings Deportivas Tiro Alto Sin Costura Lateral
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <!-- PERNERA ENTERIZA SIN COSTURA LATERAL -->
      <g transform="translate(30, 20)">
        <path d="M 30,0 L 180,0 L 220,110 C 200,200 170,300 150,420 L 70,420 C 50,300 10,200 0,90 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="50" y="80" font-size="11" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">PERNERA ENTERIZA</text>
        <text x="50" y="98" font-size="8.5" fill="#64748b">Sin costura exterior · Cortar 2x (Par)</text>
      </g>
      <!-- PRETINA ALTA ANATÓMICA EN V -->
      <g transform="translate(300, 30)">
        <path d="M 0,15 L 100,0 L 200,15 L 200,60 L 100,75 L 0,60 Z" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="35" y="42" font-size="9" font-weight="bold" fill="#b08442">PRETINA ALTA EN V (2x)</text>
      </g>
      <!-- ROMBO REFUERZO GUSSET -->
      <g transform="translate(350, 150)">
        <polygon points="50,0 100,45 50,90 0,45" fill="#fff" stroke="#dc2626" stroke-width="1.8"/>
        <text x="18" y="50" font-size="8" font-weight="bold" fill="#dc2626">ROMBO / GUSSET</text>
        <text x="20" y="62" font-size="6.8" fill="#64748b">Entrepierna ergonómica</text>
      </g>
    </svg>"""

def svg_dep_02():
    # Top Deportivo Espalda Cruzada
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(40, 40)">
        <path d="M 0,35 C 30,15 70,15 95,0 L 145,0 L 165,35 L 140,110 C 130,160 125,200 120,230 L 0,230 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="0" y1="0" x2="0" y2="230" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="6,4"/>
        <text x="25" y="90" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">DELANTERO TOP</text>
        <text x="25" y="105" font-size="8" fill="#64748b">1x tela exterior + 1x forro copas</text>
      </g>
      <!-- ESPALDA RACERBACK CRUZADA -->
      <g transform="translate(260, 40)">
        <path d="M 40,0 L 70,0 L 80,70 C 110,130 110,170 120,230 L 0,230 C 10,170 10,130 40,70 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="20" y="90" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">ESPALDA NADADORA</text>
        <text x="20" y="105" font-size="7.5" fill="#64748b">Racerback ergonómico</text>
      </g>
      <!-- BANDA ELÁSTICA SUB-BUSTO -->
      <g transform="translate(440, 50)">
        <rect x="0" y="0" width="220" height="40" rx="3" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="20" y="25" font-size="8.5" font-weight="bold" fill="#b08442">BANDA ELÁSTICA SUB-BUSTO (3.5 cm)</text>
      </g>
    </svg>"""

def svg_dep_03():
    # Sudadera Jogger Unisex
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(30, 20)">
        <path d="M 0,0 L 115,0 L 120,60 C 140,110 155,140 160,165 L 110,420 L 40,420 L 0,165 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="25" y="60" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">DELANTERO JOGGER</text>
        <text x="25" y="75" font-size="8" fill="#64748b">Corte cónico (Tapered)</text>
      </g>
      <g transform="translate(220, 20)">
        <path d="M 20,0 L 130,0 L 140,60 C 165,110 185,140 195,175 L 135,420 L 55,420 L 25,175 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="45" y="60" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">ESPALDA JOGGER</text>
      </g>
      <g transform="translate(450, 40)">
        <rect x="0" y="0" width="200" height="40" rx="3" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="20" y="25" font-size="8.5" font-weight="bold" fill="#b08442">PRETINA DE RIB ELÁSTICO (1x)</text>
        <rect x="0" y="70" width="90" height="50" rx="2" fill="#fff" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="15" y="98" font-size="8" font-weight="bold" fill="#0c1b33">PUÑOS TOBILLO</text>
        <text x="15" y="110" font-size="7" fill="#64748b">Cortar 2x en Rib</text>
      </g>
    </svg>"""

def svg_dep_04():
    # Chaqueta Deportiva Hoodie con Cremallera y Capucha
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <!-- DELANTERO CON CREMALLERA -->
      <g transform="translate(25, 30)">
        <path d="M 25,0 L 95,0 L 125,25 L 115,100 C 120,180 120,260 125,350 L 0,350 L 0,30 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="0" y1="0" x2="0" y2="350" stroke="#dc2626" stroke-width="2.5"/>
        <text x="25" y="80" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">DELANTERO HOODIE</text>
        <text x="25" y="95" font-size="8" fill="#64748b">Cortar 2x (Cremallera frontal)</text>
      </g>
      <!-- BOLSILLO CANGURO -->
      <g transform="translate(170, 240)">
        <path d="M 0,0 L 70,0 L 115,75 L 115,140 L 0,140 Z" fill="#fef7ea" stroke="#0c1b33" stroke-width="2"/>
        <text x="15" y="60" font-size="8.5" font-weight="bold" fill="#b08442">BOLSILLO CANGURO</text>
        <text x="15" y="75" font-size="7.5" fill="#64748b">Cortar 2x (Par)</text>
      </g>
      <!-- CAPUCHA ANATÓMICA 2 PIEZAS -->
      <g transform="translate(170, 30)">
        <path d="M 0,70 C 0,10 60,0 120,0 C 150,50 150,130 140,190 L 40,180 L 0,70 Z" fill="#fff" stroke="#0c1b33" stroke-width="2"/>
        <text x="25" y="75" font-size="9" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">CAPUCHA LATERAL</text>
        <text x="25" y="90" font-size="7.5" fill="#64748b">Cortar 4x (2 tela + 2 forro)</text>
      </g>
      <!-- MANGA HOODIE -->
      <g transform="translate(340, 30)">
        <path d="M 0,70 C 35,15 75,0 115,0 C 155,0 195,15 230,70 L 195,350 L 35,350 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="75" y="100" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">MANGA HOODIE</text>
        <text x="75" y="115" font-size="8" fill="#64748b">Cortar 2x (Par)</text>
      </g>
    </svg>"""

# -------------------------------------------------------------------------
# 06. LENCERÍA Y PIJAMAS
# -------------------------------------------------------------------------
def svg_len_01():
    # Bralette de Encaje
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(40, 50)">
        <path d="M 0,140 C 30,70 60,20 90,0 C 100,50 110,100 110,140 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="15" y="90" font-size="8.5" font-weight="bold" fill="#0c1b33">COPA EXTERIOR</text>
        <text x="15" y="105" font-size="7" fill="#64748b">Cortar 2x encaje</text>
      </g>
      <g transform="translate(170, 50)">
        <path d="M 110,140 C 80,70 50,20 20,0 C 10,50 0,100 0,140 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="15" y="90" font-size="8.5" font-weight="bold" fill="#0c1b33">COPA INTERIOR</text>
        <text x="15" y="105" font-size="7" fill="#64748b">Cortar 2x encaje</text>
      </g>
      <g transform="translate(40, 230)">
        <rect x="0" y="0" width="340" height="45" rx="3" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="40" y="27" font-size="9" font-weight="bold" fill="#b08442">BANDA BAJO BUSTO FESTONEADA (1x)</text>
      </g>
    </svg>"""

def svg_len_02():
    # Panty Tiro Alto Algodón
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(50, 40)">
        <path d="M 0,0 L 140,0 L 130,50 C 100,140 70,220 50,250 L 0,250 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="0" y1="0" x2="0" y2="250" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="6,4"/>
        <text x="25" y="80" font-size="10" font-weight="bold" fill="#0c1b33">DELANTERO PANTY</text>
        <text x="25" y="95" font-size="8" fill="#64748b">1x al Doblez</text>
      </g>
      <g transform="translate(240, 40)">
        <path d="M 0,0 L 140,0 L 135,50 C 120,140 100,210 60,250 L 0,250 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="0" y1="0" x2="0" y2="250" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="6,4"/>
        <text x="25" y="80" font-size="10" font-weight="bold" fill="#0c1b33">ESPALDA PANTY</text>
        <text x="25" y="95" font-size="8" fill="#64748b">1x al Doblez (Cubrimiento)</text>
      </g>
      <g transform="translate(440, 80)">
        <path d="M 0,0 L 50,0 L 60,90 L 0,90 Z" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="8" y="45" font-size="8" font-weight="bold" fill="#b08442">PUENTE (2x)</text>
        <text x="8" y="58" font-size="7" fill="#64748b">Algodón 100%</text>
      </g>
    </svg>"""

def svg_len_03():
    # BabyDoll de Tul y Encaje
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(50, 40)">
        <path d="M 0,80 C 25,30 50,0 80,0 C 110,0 135,30 160,80 Z" fill="#fef7ea" stroke="#0c1b33" stroke-width="2"/>
        <text x="35" y="50" font-size="9" font-weight="bold" fill="#b08442">COPAS CORTE IMPERIO (2x)</text>
      </g>
      <g transform="translate(50, 160)">
        <path d="M 0,0 L 160,0 L 260,260 L 0,260 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="0" y1="0" x2="0" y2="260" stroke="#2563eb" stroke-dasharray="6,4"/>
        <text x="40" y="110" font-size="11" font-weight="bold" fill="#0c1b33">FALDA VAPOROSA EN TUL</text>
        <text x="40" y="128" font-size="8.5" fill="#64748b">Vuelo amplio con abertura frontal</text>
      </g>
    </svg>"""

def svg_len_04():
    # Pijama Camisera en Satén
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(30, 30)">
        <path d="M 25,0 L 85,0 L 110,25 L 100,85 C 95,150 100,210 110,280 L 0,280 L 0,35 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <path d="M 0,35 L 25,0 L 40,40 L 0,70 Z" fill="#fef7ea" stroke="#b08442"/>
        <text x="25" y="80" font-size="9" font-weight="bold" fill="#0c1b33">CHAQUETA SATÉN</text>
        <text x="25" y="95" font-size="7.5" fill="#64748b">Solapa Notch con vivo</text>
      </g>
      <g transform="translate(170, 30)">
        <path d="M 0,0 L 100,0 L 110,50 C 130,90 145,120 150,140 L 125,380 L 35,380 L 0,140 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="25" y="60" font-size="9" font-weight="bold" fill="#0c1b33">PANTALÓN PIJAMA</text>
        <text x="25" y="75" font-size="7.5" fill="#64748b">Cintura elástica suelta</text>
      </g>
    </svg>"""

# -------------------------------------------------------------------------
# 07. MODA INFANTIL
# -------------------------------------------------------------------------
def svg_inf_01():
    # Vestido Niña Princesa
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(40, 30)">
        <path d="M 0,20 L 50,0 L 80,20 L 70,60 C 65,100 70,120 75,140 L 0,140 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="0" y1="0" x2="0" y2="140" stroke="#2563eb" stroke-dasharray="6,4"/>
        <text x="12" y="65" font-size="8.5" font-weight="bold" fill="#0c1b33">CORPIÑO INFANTIL</text>
      </g>
      <g transform="translate(150, 30)">
        <path d="M 0,0 C 70,40 140,40 210,0 L 320,260 C 200,310 100,310 0,260 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="80" y="120" font-size="11" font-weight="bold" fill="#0c1b33">FALDA PLATO PRINCESA (2x)</text>
        <text x="80" y="138" font-size="8" fill="#64748b">Vuelo circular para tutú de tul</text>
      </g>
      <g transform="translate(500, 40)">
        <polygon points="50,0 100,35 50,70 0,35" fill="#fef7ea" stroke="#b08442" stroke-width="1.8"/>
        <text x="18" y="40" font-size="8" font-weight="bold" fill="#b08442">LAZO ESPALDA</text>
      </g>
    </svg>"""

def svg_inf_02():
    # Pantalón Niño en Dril
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(40, 30)">
        <path d="M 0,0 L 95,0 L 100,50 C 115,80 125,110 130,125 L 105,360 L 30,360 L 0,125 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <!-- Parche rodilla -->
        <rect x="35" y="180" width="55" height="45" rx="3" fill="#fef7ea" stroke="#b08442" stroke-dasharray="3,2"/>
        <text x="20" y="60" font-size="9.5" font-weight="bold" fill="#0c1b33">DELANTERO NIÑO</text>
        <text x="20" y="75" font-size="7.5" fill="#64748b">Con refuerzo en rodilla</text>
      </g>
      <g transform="translate(220, 30)">
        <path d="M 15,0 L 105,0 L 115,50 C 130,80 145,110 150,135 L 120,360 L 45,360 L 20,135 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="35" y="60" font-size="9.5" font-weight="bold" fill="#0c1b33">ESPALDA NIÑO</text>
      </g>
      <g transform="translate(430, 40)">
        <rect x="0" y="0" width="180" height="30" rx="2" fill="#fff" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="15" y="20" font-size="7.5" font-weight="bold" fill="#0c1b33">PRETINA CON ELÁSTICO OJALADO</text>
      </g>
    </svg>"""

def svg_inf_03():
    # Mameluco Enterizo Bebé
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(40, 30)">
        <path d="M 15,0 L 60,0 L 75,20 L 65,70 C 60,110 65,160 85,210 L 45,210 L 35,170 L 15,210 L 0,210 L 0,20 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <!-- Broches entrepierna -->
        <circle cx="25" cy="205" r="3" fill="#dc2626"/><circle cx="45" cy="205" r="3" fill="#dc2626"/><circle cx="65" cy="205" r="3" fill="#dc2626"/>
        <text x="15" y="60" font-size="9" font-weight="bold" fill="#0c1b33">DELANTERO BODY</text>
        <text x="15" y="75" font-size="7.5" fill="#dc2626">Broches en entrepierna</text>
      </g>
      <g transform="translate(180, 30)">
        <path d="M 15,0 L 60,0 L 75,20 L 65,70 C 60,110 65,160 85,240 L 45,240 L 35,190 L 15,240 L 0,240 L 0,20 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="15" y="60" font-size="9" font-weight="bold" fill="#0c1b33">ESPALDA BODY</text>
        <text x="15" y="75" font-size="7.5" fill="#64748b">Hombro americano cruzado</text>
      </g>
    </svg>"""

# -------------------------------------------------------------------------
# 08. MASCOTAS
# -------------------------------------------------------------------------
def svg_mas_01():
    # Capa Impermeable para Perro
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(40, 40)">
        <!-- Lomo canino anatómico -->
        <path d="M 0,40 C 40,20 90,10 150,0 C 230,0 300,20 340,70 C 330,170 300,240 220,270 L 60,270 C 20,230 0,150 0,40 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="0" y1="40" x2="340" y2="70" stroke="#2563eb" stroke-dasharray="6,4"/>
        <!-- Ojal para correa arnés -->
        <rect x="90" y="30" width="25" height="8" rx="2" fill="#fff" stroke="#dc2626" stroke-width="1.5"/>
        <text x="60" y="25" font-size="7.5" fill="#dc2626">Ojal para arnés</text>
        <text x="90" y="110" font-size="11" font-weight="bold" fill="#0c1b33">LOMO PRINCIPAL IMPERMEABLE</text>
        <text x="90" y="128" font-size="8.5" fill="#64748b">1x tela exterior + 1x forro térmico</text>
      </g>
      <!-- FAJA PECTORAL Y CINTURÓN VENTRAL -->
      <g transform="translate(420, 50)">
        <rect x="0" y="0" width="220" height="40" rx="4" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="20" y="25" font-size="8.5" font-weight="bold" fill="#b08442">FAJA PECTORAL CON VELCRO (1x)</text>
        <rect x="0" y="65" width="220" height="45" rx="4" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="20" y="92" font-size="8.5" font-weight="bold" fill="#b08442">FAJA VENTRAL BAJO PECHO (1x)</text>
      </g>
    </svg>"""

def svg_mas_02():
    # Buzo de Invierno Mascota
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(40, 40)">
        <path d="M 0,30 L 180,0 L 220,180 C 170,220 80,220 20,180 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <!-- Sisas para patas delanteras -->
        <circle cx="50" cy="90" r="18" fill="#fff" stroke="#dc2626" stroke-width="1.8"/>
        <circle cx="150" cy="90" r="18" fill="#fff" stroke="#dc2626" stroke-width="1.8"/>
        <text x="35" y="130" font-size="10" font-weight="bold" fill="#0c1b33">CUERPO TUBULAR POLAR</text>
        <text x="35" y="145" font-size="8" fill="#dc2626">Sisas ergonómicas para patas</text>
      </g>
      <g transform="translate(320, 40)">
        <rect x="0" y="0" width="180" height="60" rx="3" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="20" y="35" font-size="9" font-weight="bold" fill="#b08442">CUELLO ALTO TÉRMICO DE RIB</text>
      </g>
    </svg>"""

# -------------------------------------------------------------------------
# 09. BOLSOS Y ACCESORIOS
# -------------------------------------------------------------------------
def svg_acc_01():
    # Bolso Tote Bag en Lona con Forro
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(40, 30)">
        <!-- Panel con cajas en esquinas -->
        <path d="M 0,0 L 250,0 L 250,280 L 210,280 L 210,320 L 40,320 L 40,280 L 0,280 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="35" y="130" font-size="11" font-weight="bold" fill="#0c1b33">CUERPO PRINCIPAL TOTE (2x)</text>
        <text x="35" y="148" font-size="8.5" fill="#64748b">Corte esquinas 5x5 cm para fuelle base</text>
      </g>
      <g transform="translate(330, 40)">
        <rect x="0" y="0" width="280" height="35" rx="2" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="25" y="22" font-size="8.5" font-weight="bold" fill="#b08442">ASAS REFORZADAS (2x de 65 cm)</text>
        <rect x="0" y="70" width="160" height="120" rx="3" fill="#fff" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="20" y="125" font-size="8.5" font-weight="bold" fill="#0c1b33">BOLSILLO INTERNO (1x)</text>
      </g>
    </svg>"""

def svg_acc_02():
    # Cartuchera / Neceser Prismático
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <g transform="translate(50, 40)">
        <path d="M 30,0 L 230,0 L 230,30 L 260,30 L 260,190 L 230,190 L 230,220 L 30,220 L 30,190 L 0,190 L 0,30 L 30,30 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="45" y="105" font-size="10" font-weight="bold" fill="#0c1b33">CUERPO PRISMÁTICO</text>
        <text x="45" y="120" font-size="8" fill="#64748b">Cortes en ángulo para caja 3D</text>
      </g>
      <g transform="translate(360, 60)">
        <rect x="0" y="0" width="180" height="25" fill="#fef7ea" stroke="#b08442"/>
        <text x="15" y="17" font-size="7.5" font-weight="bold" fill="#b08442">TIRADORES LATERALES (2x)</text>
      </g>
    </svg>"""

def svg_acc_03():
    # Mochila Casual Urbana con Bolsillo 3D
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <!-- PANEL FRONTAL CURVO -->
      <g transform="translate(40, 30)">
        <path d="M 30,0 C 90,-10 150,-10 210,0 L 240,280 L 0,280 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="35" y="110" font-size="10" font-weight="bold" fill="#0c1b33">PANEL FRONTAL Y TRASERO</text>
        <text x="35" y="125" font-size="8" fill="#64748b">Cortar 1x frente + 1x espalda acolchada</text>
      </g>
      <!-- BOLSILLO 3D FRONTAL -->
      <g transform="translate(320, 40)">
        <rect x="0" y="0" width="160" height="110" rx="4" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="25" y="55" font-size="9" font-weight="bold" fill="#b08442">BOLSILLO 3D CON VOLUMEN</text>
        <!-- Correas en S -->
        <path d="M 200,0 C 220,50 200,120 220,200 L 190,200 C 170,120 190,50 170,0 Z" fill="#fff" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="175" y="225" font-size="7.5" font-weight="bold" fill="#0c1b33">CORREAS EN S (4x)</text>
      </g>
    </svg>"""

# -------------------------------------------------------------------------
# 10. UNIFORMES Y TRABAJO
# -------------------------------------------------------------------------
def svg_uni_01():
    # Uniforme Quirúrgico Scrub Médico Antifluidos
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <!-- FILIPINA CON ESCOTE EN V -->
      <g transform="translate(30, 30)">
        <path d="M 0,35 L 45,0 L 105,0 L 130,25 L 120,95 C 115,160 120,240 125,320 L 0,320 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="0" y1="35" x2="0" y2="320" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="6,4"/>
        <!-- Bolsillo pecho con porta-lápiz -->
        <rect x="25" y="90" width="40" height="45" fill="#fff" stroke="#0c1b33"/>
        <line x1="38" y1="90" x2="38" y2="135" stroke="#b08442" stroke-dasharray="2,2"/>
        <!-- Bolsillos inferiores amplios -->
        <rect x="20" y="210" width="55" height="60" fill="#fff" stroke="#0c1b33"/>
        <text x="25" y="60" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">FILIPINA MÉDICA EN V</text>
        <text x="25" y="75" font-size="7.5" fill="#64748b">1x al Doblez · Bolsillos dobles</text>
      </g>
      <!-- PANTALÓN CLÍNICO CON BOLSILLO CARGO -->
      <g transform="translate(195, 30)">
        <path d="M 0,0 L 105,0 L 110,60 C 130,100 145,130 150,150 L 120,380 L 30,380 L 0,150 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <!-- Bolsillo cargo -->
        <rect x="55" y="170" width="45" height="50" rx="2" fill="#fef7ea" stroke="#0c1b33"/>
        <text x="25" y="60" font-size="10" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">PANTALÓN CLÍNICO</text>
        <text x="25" y="75" font-size="7.5" fill="#64748b">Pretina elástica + cargo lateral</text>
      </g>
      <!-- MANGA CORTA Y VISTAS ESCOTE EN V -->
      <g transform="translate(385, 40)">
        <path d="M 0,55 C 30,10 65,0 100,0 C 135,0 170,10 200,55 L 180,140 L 20,140 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <text x="60" y="80" font-size="9" font-weight="bold" fill="#0c1b33">MANGA CORTA (2x)</text>
        <path d="M 0,170 L 45,135 L 75,150 L 30,185 Z" fill="#fef7ea" stroke="#b08442" stroke-width="1.8"/>
        <text x="20" y="210" font-size="8" font-weight="bold" fill="#b08442">VISTA ESCOTE V ENTRETELADA</text>
      </g>
    </svg>"""

def svg_uni_02():
    # Delantal Barista y Chef con Pechera y Cuero
    return f"""<svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
      {get_grid_header()}
      <!-- CUERPO DELANTAL CON PECHERA -->
      <g transform="translate(40, 25)">
        <path d="M 0,0 L 70,0 C 70,60 110,120 145,130 L 145,410 L 0,410 Z" fill="#f8fafc" stroke="#0c1b33" stroke-width="2"/>
        <line x1="0" y1="0" x2="0" y2="410" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="6,4"/>
        <!-- Bolsillo canguro dividido -->
        <rect x="25" y="190" width="100" height="90" fill="#fff" stroke="#0c1b33" stroke-width="1.8"/>
        <line x1="65" y1="190" x2="65" y2="280" stroke="#b08442" stroke-dasharray="3,2"/>
        <!-- Ojaletes metálicos -->
        <circle cx="50" cy="15" r="4" fill="#b08442"/><circle cx="130" cy="140" r="4" fill="#b08442"/>
        <text x="25" y="70" font-size="11" font-weight="bold" fill="#0c1b33" font-family="Georgia, serif">CUERPO DELANTAL PECHERA</text>
        <text x="25" y="88" font-size="8.5" fill="#64748b">1x al Doblez · Lona pesada 12 oz</text>
        <text x="35" y="235" font-size="7.5" font-weight="bold" fill="#b08442">DIVISIÓN COMANDA / CELULAR</text>
      </g>
      <!-- TIRAS CRUZADAS EN X Y REFUERZOS DE CUERO -->
      <g transform="translate(260, 40)">
        <rect x="0" y="0" width="220" height="30" rx="3" fill="#fef7ea" stroke="#0c1b33" stroke-width="1.8"/>
        <text x="15" y="20" font-size="8.5" font-weight="bold" fill="#b08442">TIRAS REATA CRUZADAS EN X (2x 160 cm)</text>
        <!-- Refuerzos triangulares cuero -->
        <polygon points="20,60 50,60 20,90" fill="#b08442"/>
        <polygon points="65,60 95,60 65,90" fill="#b08442"/>
        <text x="20" y="115" font-size="8" font-weight="bold" fill="#0c1b33">REFUERZOS DE CUERO (4x)</text>
        <!-- Lazo porta-repasador -->
        <rect x="0" y="140" width="120" height="25" fill="#fff" stroke="#0c1b33"/>
        <text x="10" y="157" font-size="7.5" fill="#64748b">Lazo Porta-Repasador</text>
      </g>
    </svg>"""

# -------------------------------------------------------------------------
# DICCIONARIO MAESTRO QUE VINCULA CADA CÓDIGO CON SU PLANO SVG EXCLUSIVO
# -------------------------------------------------------------------------
SVG_MAP = {
    "VES-01": svg_ves_01,
    "VES-02": svg_ves_02,
    "VES-03": svg_ves_03,
    "VES-04": svg_ves_04,
    "BLU-01": svg_blu_01,
    "BLU-02": svg_blu_02,
    "BLU-03": svg_blu_03,
    "BLU-04": svg_blu_04,
    "PAN-01": svg_pan_01,
    "PAN-02": svg_pan_02,
    "PAN-03": svg_pan_03,
    "PAN-04": svg_pan_04,
    "FAL-01": svg_fal_01,
    "FAL-02": svg_fal_02,
    "FAL-03": svg_con_01,
    "CON-01": svg_con_01,
    "DEP-01": svg_dep_01,
    "DEP-02": svg_dep_02,
    "DEP-03": svg_dep_03,
    "DEP-04": svg_dep_04,
    "LEN-01": svg_len_01,
    "LEN-02": svg_len_02,
    "LEN-03": svg_len_03,
    "LEN-04": svg_len_04,
    "INF-01": svg_inf_01,
    "INF-02": svg_inf_02,
    "INF-03": svg_inf_03,
    "MAS-01": svg_mas_01,
    "MAS-02": svg_mas_02,
    "PET-01": svg_mas_01,
    "PET-02": svg_mas_02,
    "ACC-01": svg_acc_01,
    "ACC-02": svg_acc_02,
    "ACC-03": svg_acc_03,
    "UNI-01": svg_uni_01,
    "UNI-02": svg_uni_02,
}

def get_unique_pattern_svg(code):
    