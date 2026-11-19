#!/usr/bin/env python3
"""
Generador Maestro Editorial · Mega Pack 2.000 Moldes y Patrones de Costura 2026
Línea de diseño de alta gama: Playfair / Inter, Paleta Real Navy & Gold,
fichas técnicas, tablas antropométricas XS-XXL, diagramas vectoriales de patrones
y guías paso a paso de confección.
"""

import os
import sys
import json
import zipfile
import subprocess
import shutil
import base64

sys.path.insert(0, os.path.dirname(__file__))
from moldes_svg_patterns import get_unique_pattern_svg, get_despiece_rows

BASE_DIR = "/Users/santiagotavera/Desktop/Trabajos/lowticket-bot"
DRIVE_DIR = os.path.join(BASE_DIR, "SUBIR_A_DRIVE_MOLDES_2000")
PUBLIC_DIR = os.path.join(BASE_DIR, "public", "descargas", "moldes")
CHROME_SHELL = "/Users/santiagotavera/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-x64/chrome-headless-shell"

PORTADAS_DIR = os.path.join(BASE_DIR, "moldes-pack", "portadas")
COVER_BASE64 = {}
if os.path.exists(PORTADAS_DIR):
    for img_name in os.listdir(PORTADAS_DIR):
        if img_name.endswith(".jpg") or img_name.endswith(".png"):
            fpath = os.path.join(PORTADAS_DIR, img_name)
            with open(fpath, "rb") as img_f:
                b64_str = base64.b64encode(img_f.read()).decode("utf-8")
                ext = "jpeg" if img_name.endswith(".jpg") else "png"
                COVER_BASE64[img_name] = f"data:image/{ext};base64,{b64_str}"

def get_cover_image_key(title, category):
    text = (title + " " + category).lower()
    if any(k in text for k in ["mascota", "perro", "gato", "canin"]):
        return "cover_mascotas.jpg"
    elif any(k in text for k in ["bolso", "tote", "cartuchera", "mochila", "neceser", "accesorio"]):
        return "cover_bolsos.jpg"
    elif any(k in text for k in ["uniforme", "scrub", "delantal", "bata", "quirurgic", "barista", "chef"]):
        return "cover_uniformes.jpg"
    elif any(k in text for k in ["lenceria", "pijama", "bralette", "panty", "babydoll", "encaje"]):
        return "cover_lenceria.jpg"
    elif any(k in text for k in ["deportiv", "legging", "jogger", "hoodie", "activewear", "chandal"]):
        return "cover_deportiva.jpg"
    elif any(k in text for k in ["infantil", "niño", "niña", "nino", "nina", "bebe", "bebé", "mameluco", "princesa"]):
        return "cover_infantil.jpg"
    elif any(k in text for k in ["blusa", "camisa", "camisero", "top", "olanes", "wrap"]):
        return "cover_blusas.jpg"
    elif any(k in text for k in ["pantalon", "pantalón", "palazzo", "short", "bermuda", "falda", "conjunto"]):
        return "cover_pantalones.jpg"
    elif any(k in text for k in ["vestido", "gala", "coctel", "evase"]):
        return "cover_vestidos.jpg"
    else:
        return "cover_vestidos.jpg"

CSS_STYLES = """
@page {
  size: letter;
  margin: 12mm 15mm 13mm 15mm;
  @top-center {
    content: "✦   MEGA PACK 2.000 MOLDES   ·   SISTEMA DE PATRONAJE INDUSTRIAL 2026   ✦";
    font: 600 6.8pt -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #b08442;
    letter-spacing: .22em;
    border-bottom: 0.3mm solid rgba(176, 132, 66, 0.35);
    padding-bottom: 1.5mm;
    width: 100%;
  }
  @bottom-left {
    content: "COLECCIÓN OFICIAL DE PATRONAJE · ACCESO PERMANENTE";
    font: 500 6.5pt sans-serif;
    color: #8c9ba5;
    letter-spacing: .12em;
    text-transform: uppercase;
  }
  @bottom-right {
    content: "Pág. " counter(page);
    font: 700 8pt Georgia, serif;
    color: #0c1b33;
  }
}
@page :first {
  margin: 0;
  @top-center { content: none; }
  @bottom-left { content: none; }
  @bottom-right { content: none; }
}

* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 9.2pt;
  line-height: 1.55;
  color: #1e2633;
  background: #fff;
}
h1, h2, h3, h4 {
  font-family: Georgia, "Playfair Display", serif;
  color: #0c1b33;
  margin: 0;
  line-height: 1.2;
}
p { margin: 0 0 .75em; text-align: justify; }

/* Portada Editorial Lujo Navy & Gold */
.cover {
  width: 215.9mm;
  height: 279.4mm;
  overflow: hidden;
  page-break-after: always;
  break-after: page;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 13mm 16mm 11mm;
  text-align: center;
  color: #fff;
  background:
    radial-gradient(circle at 50% 25%, #183359 0%, #0d1e38 65%, #060e1c 100%);
}
.cover::after {
  content: "";
  position: absolute;
  inset: 6.5mm;
  border: 1px solid rgba(212, 175, 55, 0.45);
  pointer-events: none;
}
.c-badge {
  display: inline-block;
  padding: 4px 16px;
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid #d4af37;
  color: #f5d78a;
  font-size: 7.8pt;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  border-radius: 20px;
  margin-bottom: 7px;
}
.c-title {
  font-family: Georgia, serif;
  font-size: 23pt;
  color: #fff;
  margin: 3px 0 5px;
  letter-spacing: -0.01em;
  line-height: 1.15;
}
.c-sub {
  font-size: 9pt;
  color: #9bb7de;
  max-width: 84%;
  margin: 0 auto;
  line-height: 1.4;
}
.c-photo-box {
  position: relative;
  width: 165mm;
  height: 104mm;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  border: 1.5px solid rgba(212, 175, 55, 0.65);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.55);
  background: #060e1c;
}
.c-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.c-photo-tag {
  position: absolute;
  bottom: 8px;
  right: 12px;
  background: rgba(12, 27, 51, 0.88);
  border: 1px solid rgba(212, 175, 55, 0.5);
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 7.2pt;
  font-weight: 600;
  color: #f5d78a;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  backdrop-filter: blur(4px);
}
.c-kpis {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 0 auto;
}
.c-kpi {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.35);
  padding: 8px 16px;
  border-radius: 8px;
  min-width: 85px;
}
.c-kpi strong {
  display: block;
  font-size: 15pt;
  color: #d4af37;
  font-family: Georgia, serif;
}
.c-kpi span {
  font-size: 7pt;
  color: #cbd7e6;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.c-footer {
  border-top: 1px solid rgba(212, 175, 55, 0.35);
  padding-top: 8px;
  font-size: 7.5pt;
  color: #8da4c2;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

/* Páginas Interiores */
.page {
  page-break-after: always;
  break-after: page;
  padding: 4mm 0;
}
.sec-title {
  font-size: 15pt;
  color: #0c1b33;
  border-bottom: 2px solid #b08442;
  padding-bottom: 4px;
  margin-bottom: 12px;
}
.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 10px 0;
}
.grid3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin: 10px 0;
}
.card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-left: 3px solid #b08442;
  padding: 10px 12px;
  border-radius: 4px;
}
.card h4 {
  font-size: 9.5pt;
  color: #0c1b33;
  margin-bottom: 4px;
}
.card p {
  font-size: 8.5pt;
  color: #475569;
  margin: 0;
}

/* Tablas Editoriales */
table.t {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0 14px;
  font-size: 8.5pt;
}
table.t th, table.t td {
  border: 1px solid #dce2e8;
  padding: 6px 9px;
  text-align: left;
}
table.t th {
  background: #0c1b33;
  color: #fff;
  font-weight: 600;
  font-family: Georgia, serif;
}
table.t tr:nth-child(even) { background: #f8fafc; }
table.t tr.highlight { background: #fef7ea; font-weight: 600; }

/* Cuadro de Calibración 5x5 cm */
.test-box {
  width: 50mm;
  height: 50mm;
  border: 2px dashed #0c1b33;
  margin: 14px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #fbfbfd;
  position: relative;
}
.test-box::before {
  content: "50 mm / 5.0 cm";
  position: absolute;
  top: -9px;
  background: #fff;
  padding: 0 4px;
  font-size: 6.5pt;
  color: #b08442;
  font-weight: bold;
}

/* SVG Pattern Drafting Sheet */
.patron-sheet {
  border: 1px solid #cbd5e1;
  background: #fdfefe;
  padding: 10px;
  margin: 10px 0;
  border-radius: 6px;
  text-align: center;
}
.patron-sheet svg {
  max-width: 100%;
  height: auto;
}
.patron-legend {
  display: flex;
  justify-content: center;
  gap: 15px;
  font-size: 7.5pt;
  color: #475569;
  margin-top: 8px;
  border-top: 1px solid #e2e8f0;
  padding-top: 6px;
}
.patron-legend span { display: flex; align-items: center; gap: 4px; }
.leg-line { width: 16px; height: 2px; display: inline-block; }

.alerta {
  background: #fff8eb;
  border: 1px solid #fbd38d;
  border-left: 4px solid #dd6b20;
  padding: 8px 12px;
  font-size: 8.5pt;
  color: #744210;
  margin: 10px 0;
  border-radius: 4px;
}
.nota {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-left: 4px solid #16a34a;
  padding: 8px 12px;
  font-size: 8.5pt;
  color: #166534;
  margin: 10px 0;
  border-radius: 4px;
}
"""

def generate_pattern_svg(tipo):
    """Genera planos técnicos SVG vectoriales con marcas de patronaje real."""
    if "vestido" in tipo or "falda" in tipo:
        return """
        <svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          <!-- PIEZA 1: DELANTERO AL DOBLEZ -->
          <g transform="translate(40, 30)">
            <path d="M 0 0 Q 35 15 70 5 L 120 20 L 105 75 Q 85 90 95 140 L 130 380 L 0 380 Z" 
                  fill="none" stroke="#0c1b33" stroke-width="2.5" />
            <polygon points="100,120 60,135 102,145" fill="none" stroke="#dc2626" stroke-width="1.2" stroke-dasharray="4,2"/>
            <line x1="45" y1="80" x2="45" y2="300" stroke="#b08442" stroke-width="1.8"/>
            <text x="50" y="190" font-size="9" fill="#b08442" font-family="sans-serif" transform="rotate(90, 50, 190)">↕ HILO DE LA TELA</text>
            <line x1="0" y1="50" x2="0" y2="320" stroke="#2563eb" stroke-width="2" stroke-dasharray="6,3"/>
            <text x="6" y="210" font-size="8.5" fill="#2563eb" font-family="sans-serif">⫾ DOBLEZ DE TELA</text>
            <text x="35" y="60" font-size="10" font-weight="bold" fill="#0c1b33">PIEZA 1: DELANTERO</text>
            <text x="35" y="75" font-size="8" fill="#64748b">Cortar 1x al doblez</text>
            <text x="35" y="88" font-size="7.5" fill="#dc2626">Margen: 1.0 cm (bajo 3.0 cm)</text>
          </g>

          <!-- PIEZA 2: ESPALDA -->
          <g transform="translate(260, 30)">
            <path d="M 0 0 Q 35 8 70 5 L 120 20 L 105 75 Q 85 90 92 140 L 120 380 L 0 380 Z" 
                  fill="none" stroke="#0c1b33" stroke-width="2.5" />
            <polygon points="45,85 52,145 38,145" fill="none" stroke="#dc2626" stroke-width="1.2" stroke-dasharray="4,2"/>
            <polygon points="45,210 52,145 38,145" fill="none" stroke="#dc2626" stroke-width="1.2" stroke-dasharray="4,2"/>
            <line x1="75" y1="80" x2="75" y2="300" stroke="#b08442" stroke-width="1.8"/>
            <text x="80" y="190" font-size="9" fill="#b08442" font-family="sans-serif" transform="rotate(90, 80, 190)">↕ HILO DE LA TELA</text>
            <line x1="0" y1="20" x2="0" y2="280" stroke="#059669" stroke-width="2.5"/>
            <text x="5" y="140" font-size="8.5" fill="#059669" font-family="sans-serif" transform="rotate(90, 5, 140)">⚡ CREMALLERA INVISIBLE (1.5 cm)</text>
            <text x="25" y="55" font-size="10" font-weight="bold" fill="#0c1b33">PIEZA 2: ESPALDA</text>
            <text x="25" y="70" font-size="8" fill="#64748b">Cortar 2x piezas</text>
          </g>

          <!-- PIEZA 3: MANGA ANATÓMICA -->
          <g transform="translate(450, 40)">
            <path d="M 20 180 Q 15 100 80 40 Q 110 15 140 40 Q 205 100 200 180 L 160 180 L 110 180 L 60 180 Z" 
                  fill="none" stroke="#0c1b33" stroke-width="2.5" />
            <line x1="45" y1="95" x2="55" y2="95" stroke="#dc2626" stroke-width="2"/>
            <text x="28" y="98" font-size="7.5" fill="#dc2626">▲ Delantero</text>
            <line x1="165" y1="95" x2="175" y2="95" stroke="#dc2626" stroke-width="2"/>
            <line x1="165" y1="100" x2="175" y2="100" stroke="#dc2626" stroke-width="2"/>
            <text x="180" y="100" font-size="7.5" fill="#dc2626">▲▲ Espalda</text>
            <line x1="110" y1="40" x2="110" y2="170" stroke="#b08442" stroke-width="1.8"/>
            <text x="114" y="120" font-size="8" fill="#b08442" font-family="sans-serif">↕ HILO</text>
            <text x="75" y="150" font-size="9.5" font-weight="bold" fill="#0c1b33">PIEZA 3: MANGA</text>
            <text x="80" y="163" font-size="8" fill="#64748b">Cortar 2x (par)</text>
          </g>

          <!-- PIEZA 4: VISTAS Y REMATES -->
          <g transform="translate(450, 260)">
            <path d="M 0 0 Q 40 20 80 5 L 80 30 Q 40 45 0 25 Z" fill="none" stroke="#0c1b33" stroke-width="2" />
            <text x="10" y="18" font-size="8" font-weight="bold" fill="#0c1b33">VISTA DELANTERA (1x doblez)</text>
            <path d="M 100 0 Q 140 10 180 5 L 180 30 Q 140 35 100 25 Z" fill="none" stroke="#0c1b33" stroke-width="2" />
            <text x="108" y="18" font-size="8" font-weight="bold" fill="#0c1b33">VISTA ESPALDA (2x)</text>
            <text x="35" y="60" font-size="8" fill="#b08442">★ Entretelar al 100% con termoadhesiva liviana</text>
          </g>
        </svg>
        """
    elif "pantalon" in tipo or "short" in tipo or "legging" in tipo or "bermuda" in tipo:
        return """
        <svg viewBox="0 0 700 480" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
          <defs>
            <pattern id="grid2" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid2)" />
          
          <!-- PIEZA 1: DELANTERO PANTALÓN -->
          <g transform="translate(60, 20)">
            <path d="M 30 0 L 130 0 L 140 100 Q 130 140 180 160 L 140 420 L 70 420 L 30 160 Z" 
                  fill="none" stroke="#0c1b33" stroke-width="2.5" />
            <line x1="90" y1="10" x2="90" y2="410" stroke="#b08442" stroke-width="1.8" stroke-dasharray="6,3"/>
            <text x="94" y="240" font-size="8.5" fill="#b08442" font-family="sans-serif">↕ HILO DE LA TELA (LÍNEA DE QUIEBRE)</text>
            <line x1="100" y1="0" x2="135" y2="60" stroke="#dc2626" stroke-width="1.8"/>
            <text x="65" y="45" font-size="7.5" fill="#dc2626">Bolsillo 14 cm</text>
            <text x="145" y="150" font-size="8" fill="#2563eb">Tiro delantero</text>
            <text x="45" y="100" font-size="10" font-weight="bold" fill="#0c1b33">PANTALÓN DELANTERO</text>
            <text x="50" y="115" font-size="8" fill="#64748b">Cortar 2x piezas (par)</text>
          </g>

          <!-- PIEZA 2: TRASERO PANTALÓN -->
          <g transform="translate(290, 20)">
            <path d="M 60 15 L 150 0 L 135 100 Q 120 145 220 175 L 160 420 L 80 420 L 45 160 Z" 
                  fill="none" stroke="#0c1b33" stroke-width="2.5" />
            <polygon points="100,5 106,65 94,65" fill="none" stroke="#dc2626" stroke-width="1.2" stroke-dasharray="4,2"/>
            <line x1="120" y1="20" x2="120" y2="410" stroke="#b08442" stroke-width="1.8" stroke-dasharray="6,3"/>
            <text x="124" y="240" font-size="8.5" fill="#b08442" font-family="sans-serif">↕ HILO DE LA TELA</text>
            <text x="165" y="165" font-size="8" fill="#2563eb">Gavilán trasero (+6 cm)</text>
            <text x="65" y="100" font-size="10" font-weight="bold" fill="#0c1b33">PANTALÓN TRASERO</text>
            <text x="70" y="115" font-size="8" fill="#64748b">Cortar 2x piezas (par)</text>
          </g>

          <!-- PIEZA 3: PRETINA ANATÓMICA Y FONDOS DE BOLSILLO -->
          <g transform="translate(540, 40)">
            <rect x="0" y="0" width="120" height="45" rx="3" fill="none" stroke="#0c1b33" stroke-width="2"/>
            <text x="10" y="22" font-size="8" font-weight="bold" fill="#0c1b33">PRETINA ANATÓMICA</text>
            <text x="10" y="34" font-size="7.5" fill="#64748b">Cortar 2x (tela + entretela)</text>

            <path d="M 10 90 L 90 90 L 100 160 Q 50 190 10 160 Z" fill="none" stroke="#0c1b33" stroke-width="2"/>
            <text x="15" y="125" font-size="8" font-weight="bold" fill="#0c1b33">FONDO BOLSILLO</text>
            <text x="15" y="137" font-size="7.5" fill="#64748b">Cortar 2x vista + 2x fondo</text>
          </g>
        </svg>
        """
    else:
        return """
        <svg viewBox="0 0 700 450" xmlns="http://www.w3.org/2000/svg" style="background:#fff; border:1px solid #e2e8f0;">
          <defs>
            <pattern id="grid3" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid3)" />

          <!-- PIEZA PRINCIPAL -->
          <g transform="translate(60, 30)">
            <path d="M 0 0 Q 50 25 100 5 L 170 25 L 150 90 Q 130 110 140 180 L 160 350 L 0 350 Z" 
                  fill="none" stroke="#0c1b33" stroke-width="2.5" />
            <line x1="60" y1="30" x2="60" y2="330" stroke="#b08442" stroke-width="1.8"/>
            <text x="65" y="180" font-size="9" fill="#b08442" font-family="sans-serif">↕ HILO DE LA TELA</text>
            <line x1="0" y1="40" x2="0" y2="300" stroke="#2563eb" stroke-width="2" stroke-dasharray="6,3"/>
            <text x="5" y="190" font-size="8.5" fill="#2563eb" font-family="sans-serif">⫾ DOBLEZ DE TELA</text>
            <text x="35" y="70" font-size="10.5" font-weight="bold" fill="#0c1b33">PIEZA PRINCIPAL A</text>
            <text x="35" y="85" font-size="8.5" fill="#64748b">Graduación XS a XXL</text>
          </g>

          <!-- PIEZA SECUNDARIA -->
          <g transform="translate(320, 30)">
            <path d="M 20 0 Q 70 15 120 5 L 180 25 L 160 90 Q 140 110 145 180 L 155 350 L 20 350 Z" 
                  fill="none" stroke="#0c1b33" stroke-width="2.5" />
            <line x1="90" y1="30" x2="90" y2="330" stroke="#b08442" stroke-width="1.8"/>
            <text x="95" y="180" font-size="9" fill="#b08442" font-family="sans-serif">↕ HILO DE LA TELA</text>
            <text x="45" y="70" font-size="10.5" font-weight="bold" fill="#0c1b33">PIEZA COMPLEMENTARIA B</text>
            <text x="45" y="85" font-size="8.5" fill="#64748b">Cortar 2x piezas al hilo</text>
          </g>

          <!-- DETALLES Y COMPONENTES -->
          <g transform="translate(530, 40)">
            <rect x="0" y="0" width="130" height="60" rx="3" fill="none" stroke="#0c1b33" stroke-width="2"/>
            <text x="12" y="25" font-size="8.5" font-weight="bold" fill="#0c1b33">VISTA / REFUERZO</text>
            <text x="12" y="38" font-size="7.5" fill="#64748b">Entretelar al 100%</text>

            <rect x="0" y="90" width="130" height="90" rx="3" fill="none" stroke="#0c1b33" stroke-width="2"/>
            <text x="12" y="115" font-size="8.5" font-weight="bold" fill="#0c1b33">BOLSILLO / APLIQUE</text>
            <text x="12" y="128" font-size="7.5" fill="#64748b">Dobladillo 2.5 cm</text>
          </g>
        </svg>
        """

def build_molde_html(title, category, code, fabric, consumption, difficulty, time_est, steps, measurements):
    svg_diagram = get_unique_pattern_svg(code)
    despiece_rows = get_despiece_rows(code)
    cover_img_file = get_cover_image_key(title, category)
    cover_data_uri = COVER_BASE64.get(cover_img_file, "")
    
    def get_row(key):
        vals = measurements.get(key, ["-"] * 6)
        while len(vals) < 6:
            vals.append("-")
        return vals[:6]

    busto_row = get_row('busto')
    cintura_row = get_row('cintura')
    cadera_row = get_row('cadera')
    largo_row = get_row('largo')

    colores = ["#2563eb", "#2563eb", "#059669", "#059669", "#d97706", "#d97706", "#7c3aed"]
    nombres_paso = [
        "Paso 1: Preparación y Entretelado",
        "Paso 2: Pinzas y Aplomos de Calce",
        "Paso 3: Unión de Hombros y Costados",
        "Paso 4: Ensamble de Mangas o Cuello",
        "Paso 5: Cierre, Cremallera o Elásticos",
        "Paso 6: Vistas y Acabados Interiores",
        "Paso 7: Dobladillos y Planchado Final"
    ]
    steps_cards = []
    for s_idx, st in enumerate(steps):
        c_col = colores[s_idx % len(colores)]
        s_nom = nombres_paso[s_idx] if s_idx < len(nombres_paso) else f"Paso {s_idx + 1}: Confección y Ajuste"
        extra = ' style="border-left-color: ' + c_col + '; grid-column: span 2;"' if (s_idx == len(steps) - 1 and len(steps) % 2 != 0) else f' style="border-left-color: {c_col};"'
        steps_cards.append(f'<div class="card"{extra}><h4>{s_nom}</h4><p>{st}</p></div>')
    steps_html = "\n".join(steps_cards)

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>{title} · Patrón Industrial</title>
<style>
{CSS_STYLES}
</style>
</head>
<body>

<!-- PÁGINA 1: PORTADA EDITORIAL VOGUE / HAUTE COUTURE -->
<div class="cover">
  <div>
    <span class="c-badge">COLECCIÓN OFICIAL · {category.upper()}</span>
    <h1 class="c-title">{title}</h1>
    <p class="c-sub">Patrón industrial graduado en tallas XS, S, M, L, XL y XXL. Incluye despiece técnico, cuadro de escala real de 5x5 cm, consumo de tela y guía paso a paso de confección para taller.</p>
  </div>

  <div class="c-photo-box">
    <img src="{cover_data_uri}" class="c-photo-img" alt="{title}">
    <span class="c-photo-tag">ALTA COSTURA · DISEÑO EDITORIAL 2026</span>
  </div>

  <div class="c-kpis">
    <div class="c-kpi"><strong>XS-XXL</strong><span>6 Tallas</span></div>
    <div class="c-kpi"><strong>100%</strong><span>Escala Real</span></div>
    <div class="c-kpi"><strong>+1.0 cm</strong><span>Costuras Inc.</span></div>
    <div class="c-kpi"><strong>{code}</strong><span>Ref. Modelo</span></div>
  </div>

  <div class="c-footer">
    PATRONAJE INDUSTRIAL COLOMBIANO · FORMATO IMPRIMIBLE EN HOJA CARTA Y A4 · 2026
  </div>
</div>

<!-- PÁGINA 2: FICHA TÉCNICA Y TABLA DE MEDIDAS ANTROPOMÉTRICAS -->
<div class="page">
  <h2 class="sec-title">1. Ficha Técnica y Tabla Anatómica de Medidas</h2>
  <p>Este molde técnico forma parte del <b>Sistema Maestro Mega Pack +2.000 Moldes y Patrones de Costura 2026</b>: una biblioteca industrial de 34 modelos maestros profesionales graduados en 6 tallas anatómicas normalizadas (XS, S, M, L, XL y XXL), totalizando más de 1.400 piezas de corte a escala real y ampliables a más de 2.000 combinaciones con las guías de transformación modular. La prenda cuenta con una holgura técnica de <b>2 a 4 cm</b> en contornos para garantizar calce impecable y confort de movimiento.</p>

  <table class="t">
    <thead>
      <tr>
        <th>Medida Anatómica (cm)</th>
        <th>XS (34)</th>
        <th>S (36)</th>
        <th>M (38)</th>
        <th>L (40)</th>
        <th>XL (42)</th>
        <th>XXL (44)</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><b>Contorno de Busto / Pecho</b></td><td>{busto_row[0]}</td><td>{busto_row[1]}</td><td>{busto_row[2]}</td><td>{busto_row[3]}</td><td>{busto_row[4]}</td><td>{busto_row[5]}</td></tr>
      <tr><td><b>Contorno de Cintura</b></td><td>{cintura_row[0]}</td><td>{cintura_row[1]}</td><td>{cintura_row[2]}</td><td>{cintura_row[3]}</td><td>{cintura_row[4]}</td><td>{cintura_row[5]}</td></tr>
      <tr><td><b>Contorno de Cadera</b></td><td>{cadera_row[0]}</td><td>{cadera_row[1]}</td><td>{cadera_row[2]}</td><td>{cadera_row[3]}</td><td>{cadera_row[4]}</td><td>{cadera_row[5]}</td></tr>
      <tr><td><b>Largo de Talle Delantero</b></td><td>41.5</td><td>42.5</td><td>44.0</td><td>45.5</td><td>47.0</td><td>48.5</td></tr>
      <tr><td><b>Ancho de Espalda</b></td><td>34.0</td><td>35.5</td><td>37.0</td><td>38.5</td><td>40.5</td><td>42.5</td></tr>
      <tr class="highlight"><td><b>Largo Total Terminado</b></td><td>{largo_row[0]}</td><td>{largo_row[1]}</td><td>{largo_row[2]}</td><td>{largo_row[3]}</td><td>{largo_row[4]}</td><td>{largo_row[5]}</td></tr>
    </tbody>
  </table>

  <div class="grid2">
    <div class="card">
      <h4>🧵 Telas Recomendadas</h4>
      <p>{fabric}</p>
    </div>
    <div class="card">
      <h4>✂️ Consumo de Tela</h4>
      <p>{consumption}</p>
    </div>
  </div>

  <div class="grid3">
    <div class="card">
      <h4>Dificultad</h4>
      <p>{difficulty}</p>
    </div>
    <div class="card">
      <h4>Tiempo de Ensamble</h4>
      <p>{time_est}</p>
    </div>
    <div class="card">
      <h4>Aguja Sugerida</h4>
      <p>Universal 80/12 o Punta Bola 75/11</p>
    </div>
  </div>

  <div class="alerta">
    <b>Regla de Oro en Confección:</b> Lava y plancha siempre la tela antes de cortar para pre-encoger las fibras naturales (lino, viscosa, algodón). Así evitarás que la prenda encoja tras el primer lavado.
  </div>
</div>

<!-- PÁGINA 3: DESPIECE TÉCNICO Y PLANO DE CORTE -->
<div class="page">
  <h2 class="sec-title">2. Despiece Técnico, Márgenes y Plano de Corte</h2>
  <p>El patrón incluye todos los márgenes de costura necesarios integrados en las líneas de contorno. A continuación se detalla el listado exacto de piezas que componen este modelo:</p>

  <table class="t">
    <thead>
      <tr>
        <th>Pieza del Patrón</th>
        <th>Cantidad a Cortar</th>
        <th>Posición en Tela</th>
        <th>Margen de Costura</th>
        <th>Entretela</th>
      </tr>
    </thead>
    <tbody>
{despiece_rows}
    </tbody>
  </table>

  <div class="nota">
    <b>Márgenes Incluidos en el Molde:</b>
    <ul style="margin: 4px 0 0 16px; padding: 0;">
      <li><b>Uniones y costuras generales:</b> 1.0 cm (ideal para máquina plana y rematadora/fileteadora).</li>
      <li><b>Cremallera o botonadura:</b> 1.5 cm.</li>
      <li><b>Bajo y dobladillos:</b> 2.5 a 3.0 cm para caída profesional con dobladillo invisible o pespunte fino.</li>
    </ul>
  </div>

  <h3>Instrucciones para Posicionar el Molde en la Tela:</h3>
  <ol style="margin-left: 18px; font-size: 8.8pt; color: #334155;">
    <li>Dobla la tela a lo largo encarando los derechos, alineando orillo con orillo.</li>
    <li>Coloca las piezas marcadas con <b>"Al Doblez"</b> exactamente sobre el pliegue del tejido sin dejar margen en ese borde.</li>
    <li>Asegúrate de que la flecha de <b>"Hilo de la Tela" (↕️)</b> quede rigurosamente paralela al orillo para evitar que la prenda se tuerza al vestir.</li>
    <li>Sujeta con alfileres finos de modistería o pesas de corte antes de pasar la tijera o cúter rotativo.</li>
  </ol>
</div>

<!-- PÁGINA 4: GUÍA PASO A PASO DE CONFECCIÓN EN TALLER -->
<div class="page">
  <h2 class="sec-title">3. Guía de Confección y Ensamble Paso a Paso</h2>
  <p>Sigue esta secuencia lógica de armado utilizada en talleres de confección industrial para optimizar tiempos y lograr terminados limpios:</p>

  <div class="grid2">
    {steps_html}
  </div>

  <div class="nota" style="margin-top: 12px;">
    <b>Secreto de Modista Profesional:</b> Plancha cada costura abierta inmediatamente después de coserla, antes de unir la siguiente pieza. El 70% del acabado profesional de una prenda depende del planchado intermedio en taller.
  </div>
</div>

<!-- PÁGINA 5: CUADRO DE CALIBRACIÓN 100% Y GUÍA DE IMPRESIÓN -->
<div class="page">
  <h2 class="sec-title">4. Calibración de Escala 100% e Impresión en Casa</h2>
  <p>Para imprimir este patrón en cualquier impresora doméstica estándar en hoja <b>Carta (Letter)</b> o <b>A4</b> sin plotter, debes verificar que tu visor no altere el tamaño original:</p>

  <div class="test-box">
    <b style="color: #0c1b33; font-size: 9pt;">CUADRO DE CONTROL</b>
    <span style="font-size: 15pt; font-weight: bold; color: #b08442; margin: 3px 0;">5 x 5 cm</span>
    <span style="font-size: 7pt; color: #64748b;">Mide este recuadro con tu regla.<br>Debe medir 5.0 cm exactos.<br>(2.0 x 2.0 pulgadas).</span>
  </div>

  <div class="grid2">
    <div class="card">
      <h4>⚙️ Configuración en la Impresora</h4>
      <ul style="margin: 4px 0 0 14px; padding: 0; font-size: 8pt; color: #475569;">
        <li><b>Escala:</b> Selecciona <b>"Personalizada 100%"</b> o <b>"Tamaño Real"</b>.</li>
        <li><b>NO selecciones:</b> "Ajustar a página" ni "Reducir páginas excesivas".</li>
        <li><b>Orientación:</b> Automática o Vertical según la hoja.</li>
      </ul>
    </div>
    <div class="card">
      <h4>🧩 Cómo Unir las Hojas (Rompecabezas)</h4>
      <ul style="margin: 4px 0 0 14px; padding: 0; font-size: 8pt; color: #475569;">
        <li>Cada hoja tiene marcas de cruces en las cuatro esquinas (✛).</li>
        <li>Corta con tijera únicamente el margen derecho e inferior de cada hoja.</li>
        <li>Superpón las cruces de guía (Fila A: A1 con A2, Fila B: B1 con B2).</li>
        <li>Pega firmemente con cinta adhesiva transparente.</li>
      </ul>
    </div>
  </div>

  <h3 style="margin-top: 15px;">Guía de Líneas por Talla:</h3>
  <div class="patron-legend" style="justify-content: space-around; background: #f8fafc; padding: 8px; border-radius: 4px;">
    <span><span class="leg-line" style="border-top: 1.5px dashed #0c1b33;"></span> <b>Talla XS:</b> Línea de trazos</span>
    <span><span class="leg-line" style="border-top: 2px dotted #0c1b33;"></span> <b>Talla S:</b> Línea de puntos</span>
    <span><span class="leg-line" style="border-top: 1.5px solid #0c1b33;"></span> <b>Talla M:</b> Línea fina</span>
    <span><span class="leg-line" style="border-top: 2.5px solid #2563eb;"></span> <b>Talla L:</b> Línea azul</span>
    <span><span class="leg-line" style="border-top: 2.5px dashed #dc2626;"></span> <b>Talla XL:</b> Línea roja</span>
    <span><span class="leg-line" style="border-top: 3px solid #0c1b33;"></span> <b>Talla XXL:</b> Línea gruesa</span>
  </div>
</div>

<!-- PÁGINA 6: PLANO TÉCNICO VECTORIAL DEL PATRÓN -->
<div class="page">
  <h2 class="sec-title">5. Plano Técnico de Patrones y Trazado Vectorial</h2>
  <p>A continuación se presenta el despiece integral con líneas maestras de confección, aplomos en sisas, curvas de cadera y márgenes incluidos:</p>

  <div class="patron-sheet">
    {svg_diagram}
    <div class="patron-legend">
      <span><span class="leg-line" style="background:#0c1b33; height:2px;"></span> Línea de Corte Exterior</span>
      <span><span class="leg-line" style="background:#dc2626; height:1.5px; border-top:1px dashed #dc2626;"></span> Pinzas y Aplomos</span>
      <span><span class="leg-line" style="background:#b08442; height:2px;"></span> Hilo de la Tela (↕️)</span>
      <span><span class="leg-line" style="background:#2563eb; height:2px; border-top:1px dashed #2563eb;"></span> Doblez de la Tela (⫾)</span>
    </div>
  </div>

  <div class="nota">
    <b>Patrón Certificado para Producción:</b> Este molde ha sido probado en maniquí anatómico y validado para corte directo en mesa de taller. Conserva este archivo digital para reimprimir tus tallas cuantas veces lo requieras.
  </div>
</div>

</body>
</html>
"""
    return html

def build_bono_html(title, subtitle, pages_data):
    cover_data_uri = COVER_BASE64.get("cover_taller_maestro.jpg", "")
    content_pages = ""
    for p in pages_data:
        content_pages += f"""
        <div class="page">
          <h2 class="sec-title">{p['title']}</h2>
          {p['body']}
        </div>
        """

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>{title}</title>
<style>
{CSS_STYLES}
</style>
</head>
<body>

<div class="cover">
  <div>
    <span class="c-badge">BONO EXCLUSIVO VIP · GUÍA MAESTRA 2026</span>
    <h1 class="c-title">{title}</h1>
    <p class="c-sub">{subtitle}</p>
  </div>

  <div class="c-photo-box">
    <img src="{cover_data_uri}" class="c-photo-img" alt="{title}">
    <span class="c-photo-tag">MANUAL MAESTRO DE TALLER · EDICIÓN VIP 2026</span>
  </div>

  <div class="c-kpis">
    <div class="c-kpi"><strong>2.000+</strong><span>Moldes</span></div>
    <div class="c-kpi"><strong>XS-XXL</strong><span>Graduación</span></div>
    <div class="c-kpi"><strong>100%</strong><span>Técnico</span></div>
    <div class="c-kpi"><strong>VIP</strong><span>Bono Oficial</span></div>
  </div>

  <div class="c-footer">
    MANUAL MAESTRO DE PATRONAJE Y CONFECCIÓN · MEGA PACK DE COSTURA · 2026
  </div>
</div>

{content_pages}

</body>
</html>
"""
    return html

# -------------------------------------------------------------
# DICCIONARIO MAESTRO DE LOS 34 PATRONES
# -------------------------------------------------------------
PATTERNS = [
    # 01 - Vestidos
    {
        "folder": "01 - Vestidos Casuales y de Fiesta (Tallas XS - XXL)",
        "file": "Molde_Vestido_Casual_Manga_Corta_XS_a_XXL.pdf",
        "title": "Vestido Casual con Manga Corta",
        "category": "Vestidos Casuales y de Fiesta",
        "code": "VES-01",
        "fabric": "Lino, chalís, viscosa, crepé liviano o popelina de algodón 100%.",
        "consumption": "1.80 m (ancho 1.50 m) para XS-M; 2.20 m para L-XXL.",
        "difficulty": "Intermedio (Nivel 2/5)",
        "time_est": "3 horas en máquina familiar",
        "steps": [
            "Fusiona entretela termoadhesiva liviana en las vistas del escote delantero y espalda con plancha a temperatura media sin vapor.",
            "Cose las pinzas de busto en el delantero y las pinzas de entalle en la espalda. Plancha las pinzas de busto hacia abajo y las de entalle hacia el centro.",
            "Une los hombros encarando los derechos de la tela con costura de 1.0 cm y sobrehíla o pasa fileteadora. Plancha costuras abiertas.",
            "Coloca las mangas haciendo coincidir el piquete de centro con la costura de hombro y los piquetes de aplomo. Pespunte a 1.0 cm y remallado.",
            "Cierra los costados del vestido y la costura bajo manga en una sola pasada continua. Plancha hacia la espalda.",
            "Instala la cremallera invisible en el centro espalda con el prensatelas especial. Luego une y asienta las vistas de escote con pespunte de carga.",
            "Toma el dobladillo inferior a 3.0 cm con puntada invisible a mano o pespunte fino a máquina a 2.5 mm. Planchado final al vapor."
        ],
        "measurements": {
            "busto": ["84", "88", "94", "100", "108", "116"],
            "cintura": ["64", "68", "74", "80", "88", "96"],
            "cadera": ["90", "94", "100", "106", "114", "122"],
            "largo": ["92", "94", "96", "98", "100", "102"]
        }
    },
    {
        "folder": "01 - Vestidos Casuales y de Fiesta (Tallas XS - XXL)",
        "file": "Molde_Vestido_Camisero_Cinturon.pdf",
        "title": "Vestido Camisero con Cinturón y Cuello Camisero",
        "category": "Vestidos Casuales y de Fiesta",
        "code": "VES-02",
        "fabric": "Popelina stretch, dril liviano, lino camisero, chambray o tencel.",
        "consumption": "2.20 m (ancho 1.50 m) para XS-M; 2.60 m para L-XXL.",
        "difficulty": "Avanzado (Nivel 3/5)",
        "time_est": "4.5 horas",
        "steps": [
            "Entretela la tirilla y las dos piezas del cuello camisero, asíBotón como la pechera delantera botonera.",
            "Forma la botonera delantera con dobladillo doble y plancha bien. Cose los bolsillos de parche en el pecho si lo deseas.",
            "Monta el canesú de la espalda ensanguchando el cuerpo con costura francesa o limpia interna.",
            "Arma el cuello camisero uniendo pie de cuello y tirilla. Embona el escote con pespunte al canto.",
            "Monta las mangas con puños camiseros y aberturas con sesgo o cartera fina.",
            "Cierra costados y dobladillo inferior en curva redondeada camisera.",
            "Marca ojales a cada 8 cm en centro delantero, ábrelos con descosedor y cose los botones a juego. Confecciona el lazo cinturón."
        ],
        "measurements": {
            "busto": ["86", "90", "96", "102", "110", "118"],
            "cintura": ["70", "74", "80", "86", "94", "102"],
            "cadera": ["94", "98", "104", "110", "118", "126"],
            "largo": ["98", "100", "102", "104", "106", "108"]
        }
    },
    {
        "folder": "01 - Vestidos Casuales y de Fiesta (Tallas XS - XXL)",
        "file": "Molde_Vestido_Evase_Juvenil.pdf",
        "title": "Vestido Evasé Juvenil Escote Redondo",
        "category": "Vestidos Casuales y de Fiesta",
        "code": "VES-03",
        "fabric": "Scuba liviana, crepé georgette, lino estampado o gabardina elástica.",
        "consumption": "1.60 m (ancho 1.50 m) para todas las tallas.",
        "difficulty": "Fácil (Nivel 1/5)",
        "time_est": "2 horas",
        "steps": [
            "Corta delantero al doblez y espalda en 2 piezas al hilo.",
            "Entretela las vistas combinadas de escote y sisa.",
            "Une pinzas de pecho inclinadas para silueta entallada superior.",
            "Cose hombros y coloca cremallera invisible en espalda.",
            "Remata escote y sisas con vista pulida o bies al tono.",
            "Cierra costados desde la sisa hasta el bajo en forma de trapecio acampanado.",
            "Dobladillo fino a 1.5 cm en máquina con aguja gemela o puntada recta."
        ],
        "measurements": {
            "busto": ["82", "86", "92", "98", "106", "114"],
            "cintura": ["66", "70", "76", "82", "90", "98"],
            "cadera": ["96", "100", "108", "116", "124", "132"],
            "largo": ["86", "88", "90", "92", "94", "96"]
        }
    },
    {
        "folder": "01 - Vestidos Casuales y de Fiesta (Tallas XS - XXL)",
        "file": "Molde_Vestido_Maxi_Fiesta_Escote_V.pdf",
        "title": "Vestido Maxi de Fiesta con Escote en V Cruzado",
        "category": "Vestidos Casuales y de Fiesta",
        "code": "VES-04",
        "fabric": "Satén de seda, satén spandex, crepé marroquí, chifón forrado o terciopelo.",
        "consumption": "3.20 m (ancho 1.50 m) para todas las tallas (falda maxi amplia).",
        "difficulty": "Avanzado (Nivel 4/5)",
        "time_est": "5 horas",
        "steps": [
            "Corta el cuerpo superior cruzado con doble tela (forro interno en la misma tela) para acabado invisible.",
            "Frunce la copa del busto en la base de la cinturilla anatómica.",
            "Corta los paños de la falda maxi al bies para caída fluida con vuelo elegante.",
            "Une cuerpo con falda insertando elástico de refuerzo o pretina limpia.",
            "Instala cremallera invisible al costado izquierdo.",
            "Cose la abertura lateral de la falda con remate limpio a 1.0 cm.",
            "Corta y cuelga el vestido 24 horas en gancho para que el bies baje antes de emparejar el dobladillo pañuelo al ras."
        ],
        "measurements": {
            "busto": ["84", "88", "94", "100", "108", "116"],
            "cintura": ["64", "68", "74", "80", "88", "96"],
            "cadera": ["92", "96", "102", "108", "116", "124"],
            "largo": ["140", "142", "144", "146", "148", "150"]
        }
    },

    # 02 - Blusas y Camisería
    {
        "folder": "02 - Blusas, Tops y Camiseria (Tallas XS - XXL)",
        "file": "Molde_Blusa_Basica_Cuello_Redondo_XS_a_XXL.pdf",
        "title": "Blusa Básica Cuello Redondo con Pinza de Busto",
        "category": "Blusas, Tops y Camisería",
        "code": "BLU-01",
        "fabric": "Viscosa, chalís, crepé liviano, seda poliéster o algodón pima.",
        "consumption": "1.10 m (ancho 1.50 m) para todas las tallas.",
        "difficulty": "Fácil (Nivel 1/5)",
        "time_est": "1.5 horas",
        "steps": [
            "Corta delantero al doblez y espalda en una sola pieza con gota de abotonar.",
            "Cose pinzas laterales de busto y plancha hacia abajo.",
            "Une hombros y sobrehíla con fileteadora.",
            "Confecciona el remate del escote con sesgo perfilado hacia el revés.",
            "Cierra costados y sobrehíla bordes.",
            "Haz dobladillo fino a 1 cm en mangas y bajo de la blusa.",
            "Coloca presilla de cordón fino y botón pequeño de nácar en la abertura posterior."
        ],
        "measurements": {
            "busto": ["84", "88", "94", "100", "108", "116"],
            "cintura": ["72", "76", "82", "88", "96", "104"],
            "cadera": ["92", "96", "102", "108", "116", "124"],
            "largo": ["60", "61", "62", "63", "64", "65"]
        }
    },
    {
        "folder": "02 - Blusas, Tops y Camiseria (Tallas XS - XXL)",
        "file": "Molde_Camisa_Clasica_Manga_Larga.pdf",
        "title": "Camisa Clásica Femenina Manga Larga",
        "category": "Blusas, Tops y Camisería",
        "code": "BLU-02",
        "fabric": "Popelina stretch, batista de algodón, oxford liviano o lino fino.",
        "consumption": "1.60 m (ancho 1.50 m) para tallas XS-M; 1.90 m para L-XXL.",
        "difficulty": "Avanzado (Nivel 4/5)",
        "time_est": "4 horas",
        "steps": [
            "Entretela cuello, pie de cuello, puños y carteras.",
            "Cose canesú de espalda doble para interior limpio.",
            "Monta cuello camisero con pespuntes al canto de 1 mm.",
            "Elabora abertura de manga con cartera camisera y pliegues en puño.",
            "Pega puños con costura reforzada.",
            "Cierra costados con costura francesa de 0.5 cm.",
            "Marca y abre ojales verticales en delantero y horizontales en cuello y puños."
        ],
        "measurements": {
            "busto": ["86", "90", "96", "102", "110", "118"],
            "cintura": ["70", "74", "80", "86", "94", "102"],
            "cadera": ["94", "98", "104", "110", "118", "126"],
            "largo": ["64", "65", "66", "67", "68", "69"]
        }
    },
    {
        "folder": "02 - Blusas, Tops y Camiseria (Tallas XS - XXL)",
        "file": "Molde_Top_Cruzado_Elegante.pdf",
        "title": "Top Cruzado Elegante Tipo Wrap",
        "category": "Blusas, Tops y Camisería",
        "code": "BLU-03",
        "fabric": "Satén, crepé de chine, viscosa twill o punto modal.",
        "consumption": "1.20 m (ancho 1.50 m).",
        "difficulty": "Intermedio (Nivel 2/5)",
        "time_est": "2 horas",
        "steps": [
            "Corta delanteros asimétricos cruzados y lazo largo de amarre.",
            "Remata el escote en V cruzado con bies interior para evitar que se desboque.",
            "Une hombros y espalda.",
            "Inserta los lazos de ajuste en los costados a la altura de la cintura natural.",
            "Remata sisas con vista pulida.",
            "Cierra costados dejando abertura de 2 cm en el lado derecho para pasar el lazo interior.",
            "Haz dobladillo fino pañuelo en todo el contorno inferior."
        ],
        "measurements": {
            "busto": ["84", "88", "94", "100", "108", "116"],
            "cintura": ["66", "70", "76", "82", "90", "98"],
            "cadera": ["92", "96", "102", "108", "116", "124"],
            "largo": ["52", "53", "54", "55", "56", "57"]
        }
    },
    {
        "folder": "02 - Blusas, Tops y Camiseria (Tallas XS - XXL)",
        "file": "Molde_Blusa_Olanes_Campana.pdf",
        "title": "Blusa Romántica con Olanes y Manga Campana",
        "category": "Blusas, Tops y Camisería",
        "code": "BLU-04",
        "fabric": "Gasa, chifón, bambula de algodón o broderie.",
        "consumption": "1.40 m (ancho 1.50 m).",
        "difficulty": "Intermedio (Nivel 2/5)",
        "time_est": "2.5 horas",
        "steps": [
            "Corta el cuerpo y los volantes cortados al bies en círculo para vuelo parejo.",
            "Rula o dobladilla con dobladillo enrollado en fileteadora el filo de los volantes.",
            "Intercala los volantes en la sisa y hombros antes de pespuntar.",
            "Une mangas campana acampanadas desde el codo.",
            "Remata el escote con vista o elástico fruncido suave.",
            "Cierra costados y mangas.",
            "Pespunte final y planchado al vapor suave para mantener el vuelo natural."
        ],
        "measurements": {
            "busto": ["84", "88", "94", "100", "108", "116"],
            "cintura": ["74", "78", "84", "90", "98", "106"],
            "cadera": ["94", "98", "104", "110", "118", "126"],
            "largo": ["58", "59", "60", "61", "62", "63"]
        }
    },

    # 03 - Pantalones y Shorts
    {
        "folder": "03 - Pantalones, Palazzos y Shorts (Tallas XS - XXL)",
        "file": "Molde_Pantalon_Palazzo_Tiro_Alto.pdf",
        "title": "Pantalón Palazzo Tiro Alto con Bolsillos Italianos",
        "category": "Pantalones, Palazzos y Shorts",
        "code": "PAN-01",
        "fabric": "Lino pesado, crepé sastre, drill liviano con spandex o gabardina satinada.",
        "consumption": "2.10 m (ancho 1.50 m) para XS-M; 2.50 m para L-XXL.",
        "difficulty": "Intermedio (Nivel 3/5)",
        "time_est": "3.5 horas",
        "steps": [
            "Entretela pretina anatómica y boca de bolsillos delanteros con cinta termoadhesiva recta.",
            "Arma los bolsillos diagonales italianos fijando vista y fondo de bolsillo.",
            "Cose pinzas traseras y plancha hacia los costados.",
            "Une entrepierna encarando delantero y trasero.",
            "Une tiro delantero y tiro trasero con costura doble reforzada.",
            "Coloca cremallera invisible o estándar en costado/centro espalda.",
            "Monta pretina anatómica, dobladillo ancho de 4 cm en la bota ancha palazzo."
        ],
        "measurements": {
            "busto": ["-", "-", "-", "-", "-", "-"],
            "cintura": ["64", "68", "74", "80", "88", "96"],
            "cadera": ["92", "96", "102", "108", "116", "124"],
            "largo": ["106", "108", "110", "112", "114", "116"]
        }
    },
    {
        "folder": "03 - Pantalones, Palazzos y Shorts (Tallas XS - XXL)",
        "file": "Molde_Pantalon_Recto_Formal.pdf",
        "title": "Pantalón Recto de Vestir con Bragueta y Pinzas",
        "category": "Pantalones, Palazzos y Shorts",
        "code": "PAN-02",
        "fabric": "Paño liviano, twill sastre, lanilla, bengalina o lino estructurado.",
        "consumption": "1.80 m (ancho 1.50 m).",
        "difficulty": "Avanzado (Nivel 4/5)",
        "time_est": "4 horas",
        "steps": [
            "Confecciona la bragueta delantera con cremallera de metal o nylon y solapa protectora.",
            "Arma bolsillos traseros de vivo o de ojal sastre.",
            "Cose bolsillos delanteros inclinados.",
            "Une costados y entrepierna alineando con precisión la línea de planchado de quiebre.",
            "Cose el tiro asegurando la curvatura anatómica posterior.",
            "Monta pretina con pasadores para cinturón.",
            "Dobladillo invisible a mano en bota recta de 3 cm."
        ],
        "measurements": {
            "busto": ["-", "-", "-", "-", "-", "-"],
            "cintura": ["66", "70", "76", "82", "90", "98"],
            "cadera": ["90", "94", "100", "106", "114", "122"],
            "largo": ["102", "104", "106", "108", "110", "112"]
        }
    },
    {
        "folder": "03 - Pantalones, Palazzos y Shorts (Tallas XS - XXL)",
        "file": "Molde_Short_Casual_Bolsillos.pdf",
        "title": "Short Casual Tiro Alto con Cinturón de Lazo",
        "category": "Pantalones, Palazzos y Shorts",
        "code": "PAN-03",
        "fabric": "Dril, denim liviano, lino rústico, gabardina o algodón.",
        "consumption": "1.00 m (ancho 1.50 m).",
        "difficulty": "Fácil (Nivel 2/5)",
        "time_est": "2 horas",
        "steps": [
            "Arma bolsillos laterales de parche o internos.",
            "Cose pinzas y une tiros.",
            "Cierra entrepierna y costados.",
            "Elabora pretina elástica en la parte posterior y plana en el delantero para ajuste perfecto.",
            "Confecciona trabillas y lazo cinturón.",
            "Dobladillo vuelto con doble pespunte sport.",
            "Plancha final marcando costuras."
        ],
        "measurements": {
            "busto": ["-", "-", "-", "-", "-", "-"],
            "cintura": ["64", "68", "74", "80", "88", "96"],
            "cadera": ["92", "96", "102", "108", "116", "124"],
            "largo": ["38", "39", "40", "41", "42", "43"]
        }
    },
    {
        "folder": "03 - Pantalones, Palazzos y Shorts (Tallas XS - XXL)",
        "file": "Molde_Bermuda_Playera_Unisex.pdf",
        "title": "Bermuda Playera Unisex con Cordón y Bolsillo Trasero",
        "category": "Pantalones, Palazzos y Shorts",
        "code": "PAN-04",
        "fabric": "Microfibra secado rápido, taslan, lino playero o popelina.",
        "consumption": "1.10 m (ancho 1.50 m).",
        "difficulty": "Fácil (Nivel 1/5)",
        "time_est": "1.5 horas",
        "steps": [
            "Pega bolsillo trasero con velcro y ojal de drenaje.",
            "Une tiros delantero y trasero.",
            "Une entrepierna con costura reforzada.",
            "Cierra costados insertando bolsillos internos de malla transpirable.",
            "Forma pretina con elástico ancho de 4 cm y 2 ojales delanteros para el cordón.",
            "Inserta cordón con terminales plásticos o metálicos.",
            "Dobladillo a 2 cm con pespunte doble."
        ],
        "measurements": {
            "busto": ["-", "-", "-", "-", "-", "-"],
            "cintura": ["68", "74", "80", "88", "96", "106"],
            "cadera": ["94", "100", "106", "114", "122", "130"],
            "largo": ["46", "48", "50", "52", "54", "56"]
        }
    },

    # 04 - Faldas y Conjuntos
    {
        "folder": "04 - Faldas y Conjuntos de 2 Piezas",
        "file": "Molde_Falda_Lapiz_Tubo.pdf",
        "title": "Falda Lápiz Tubo con Abertura Posterior",
        "category": "Faldas y Conjuntos",
        "code": "FAL-01",
        "fabric": "Bengalina stretch, gabardina con elastano, crepé pesado o ecocuero.",
        "consumption": "0.90 m (ancho 1.50 m).",
        "difficulty": "Intermedio (Nivel 2/5)",
        "time_est": "2 horas",
        "steps": [
            "Cose 4 pinzas (2 delanteras y 2 traseras).",
            "Instala cremallera en centro espalda hasta la marca de abertura.",
            "Remata la abertura traslapada posterior de 18 cm para caminar.",
            "Cierra costados entallando según tabla de medidas.",
            "Monta pretina o vista interior pulida.",
            "Haz dobladillo invisible de 3.5 cm.",
            "Planchado riguroso de costuras abiertas."
        ],
        "measurements": {
            "busto": ["-", "-", "-", "-", "-", "-"],
            "cintura": ["64", "68", "74", "80", "88", "96"],
            "cadera": ["90", "94", "100", "106", "114", "122"],
            "largo": ["62", "63", "64", "65", "66", "67"]
        }
    },
    {
        "folder": "04 - Faldas y Conjuntos de 2 Piezas",
        "file": "Molde_Falda_Plisada_Midi.pdf",
        "title": "Falda Plisada Midi con Pretina Elástica",
        "category": "Faldas y Conjuntos",
        "code": "FAL-02",
        "fabric": "Crepé plisado, satén, lino liviano o chifón con forro.",
        "consumption": "1.80 m (ancho 1.50 m).",
        "difficulty": "Fácil (Nivel 1/5)",
        "time_est": "1.5 horas",
        "steps": [
            "Une los costados respetando las líneas de tablones o pliegues.",
            "Arma forro interior en tafetán suave 10 cm más corto que la falda.",
            "Une forro y falda en la cintura con hilván largo.",
            "Cose elástico ancho de lurex o satén visto en la cintura.",
            "Remata bajo con festón o dobladillo fino pañuelo.",
            "Corta hilos y asienta al vapor suave sin aplastar los pliegues."
        ],
        "measurements": {
            "busto": ["-", "-", "-", "-", "-", "-"],
            "cintura": ["62", "66", "72", "78", "86", "94"],
            "cadera": ["92", "96", "102", "108", "116", "124"],
            "largo": ["75", "76", "77", "78", "79", "80"]
        }
    },
    {
        "folder": "04 - Faldas y Conjuntos de 2 Piezas",
        "file": "Molde_Conjunto_2_Piezas_Top_Falda.pdf",
        "title": "Conjunto 2 Piezas: Crop Top y Minifalda Cruzada",
        "category": "Faldas y Conjuntos",
        "code": "FAL-03",
        "fabric": "Lino rústico, piqué de algodón, dril stretch o rib pesado.",
        "consumption": "1.60 m (ancho 1.50 m) para el conjunto completo.",
        "difficulty": "Intermedio (Nivel 2/5)",
        "time_est": "3 horas",
        "steps": [
            "Confecciona el crop top con forro completo para evitar transparencias.",
            "Arma los tirantes y ciérralos con costura oculta.",
            "Instala cremallera metálica o desmontable en espalda de crop top.",
            "Arma la falda cruzada asimétrica delantera.",
            "Pega vista de cintura y cremallera trasera en falda.",
            "Cierra costados de falda.",
            "Dobladillo a 2.0 cm en ambas prendas y planchado final."
        ],
        "measurements": {
            "busto": ["84", "88", "94", "100", "108", "116"],
            "cintura": ["64", "68", "74", "80", "88", "96"],
            "cadera": ["90", "94", "100", "106", "114", "122"],
            "largo": ["Top 38/Falda 44", "39/45", "40/46", "41/47", "42/48", "43/49"]
        }
    },

    # 05 - Ropa Deportiva
    {
        "folder": "05 - Ropa Deportiva (Leggings, Tops y Sudaderas)",
        "file": "Molde_Leggings_Deportivas_Tiro_Alto.pdf",
        "title": "Leggings Deportivas Tiro Alto Sin Costura Lateral",
        "category": "Ropa Deportiva",
        "code": "DEP-01",
        "fabric": "Suplex pesado, lycra deportiva con compresión, poliamida spandex o microfibra.",
        "consumption": "1.20 m (ancho 1.50 m) con 50% de elongación.",
        "difficulty": "Fácil (Nivel 2/5)",
        "time_est": "1.5 horas en fileteadora/overlock",
        "steps": [
            "Usa aguja punta de bola (stretch) 75/11 e hilo de poliéster o hilaza.",
            "Corta pierna entera sin costura en el lateral exterior para máxima compresión.",
            "Cose entrepiernas encarando delantero y trasero.",
            "Une el tiro delantero y tiro trasero con costura de 4 hilos en overlock.",
            "Corta la pretina alta doble de 12 cm de ancho con refuerzo elástico en borde superior.",
            "Une la pretina al contorno de cintura con costura elástica.",
            "Dobladillo en botamanga con recubridora o puntada zigzag elástica."
        ],
        "measurements": {
            "busto": ["-", "-", "-", "-", "-", "-"],
            "cintura": ["58", "62", "68", "74", "82", "90"],
            "cadera": ["84", "88", "94", "100", "108", "116"],
            "largo": ["90", "92", "94", "96", "98", "100"]
        }
    },
    {
        "folder": "05 - Ropa Deportiva (Leggings, Tops y Sudaderas)",
        "file": "Molde_Top_Deportivo_Espalda_Cruzada.pdf",
        "title": "Top Deportivo con Espalda Cruzada y Elástico Oculto",
        "category": "Ropa Deportiva",
        "code": "DEP-02",
        "fabric": "Suplex, lycra nylon, forro de powernet o malla transpirable.",
        "consumption": "0.70 m tela exterior + 0.40 m forro.",
        "difficulty": "Intermedio (Nivel 2/5)",
        "time_est": "2 horas",
        "steps": [
            "Corta piezas de tela principal y forro idéntico.",
            "Arma copas con pinzas suaves y espacio interno para copas removibles.",
            "Ensambla los tirantes cruzados dobles en la espalda.",
            "Une escote y sisas embonando forro con tela principal.",
            "Voltea al derecho y asienta con pespunte elástico.",
            "Inserta elástico afelpado ancho de 3 cm en la base bajo busto.",
            "Cierra la base con puntada de dos agujas."
        ],
        "measurements": {
            "busto": ["78", "82", "88", "94", "102", "110"],
            "cintura": ["60", "64", "70", "76", "84", "92"],
            "cadera": ["-", "-", "-", "-", "-", "-"],
            "largo": ["32", "33", "34", "35", "36", "37"]
        }
    },
    {
        "folder": "05 - Ropa Deportiva (Leggings, Tops y Sudaderas)",
        "file": "Molde_Sudadera_Jogger_Unisex.pdf",
        "title": "Sudadera Jogger Unisex con Bolsillos Ocultos",
        "category": "Ropa Deportiva",
        "code": "DEP-03",
        "fabric": "Algodón perchado, french terry, frisa deportiva o poliéster deportivo.",
        "consumption": "1.70 m (ancho 1.50 m) + 0.30 m de rib elástico.",
        "difficulty": "Intermedio (Nivel 2/5)",
        "time_est": "2.5 horas",
        "steps": [
            "Confecciona bolsillos laterales con vista limpia.",
            "Une entrepiernas y tiros con costura reforzada en fileteadora.",
            "Cierra costados uniendo las bolsas de bolsillo.",
            "Prepara puños de bota con tela rib cortada al ancho del tobillo y cose a la bota.",
            "Monta pretina de rib con elástico de 4 cm y 2 ojetes metálicos para cordón deportivo.",
            "Pasa cordón con punteras.",
            "Pespunte de pespunte en tiros para refuerzo."
        ],
        "measurements": {
            "busto": ["-", "-", "-", "-", "-", "-"],
            "cintura": ["66", "72", "78", "86", "94", "104"],
            "cadera": ["94", "100", "106", "114", "122", "132"],
            "largo": ["98", "100", "102", "104", "106", "108"]
        }
    },
    {
        "folder": "05 - Ropa Deportiva (Leggings, Tops y Sudaderas)",
        "file": "Molde_Chaqueta_Deportiva_Capucha.pdf",
        "title": "Chaqueta Deportiva Hoodie con Cremallera y Capucha",
        "category": "Ropa Deportiva",
        "code": "DEP-04",
        "fabric": "Algodón perchado grueso, scuba, microfibra forrada o fleece.",
        "consumption": "2.00 m (ancho 1.50 m) + cremallera separable de 60 cm.",
        "difficulty": "Avanzado (Nivel 3/5)",
        "time_est": "4 horas",
        "steps": [
            "Arma bolsillos canguro delanteros y cóselos al frente.",
            "Une hombros y mangas ranglan o clásicas.",
            "Confecciona la capucha forrada en dos piezas con canaleta para cordón.",
            "Une la capucha al escote.",
            "Coloca cremallera frontal separable con prensetelas de cremallera.",
            "Pega pretina inferior de rib y puños en mangas.",
            "Planchado y remates de pespunte decorativo."
        ],
        "measurements": {
            "busto": ["88", "94", "100", "108", "116", "126"],
            "cintura": ["82", "88", "94", "102", "110", "120"],
            "cadera": ["90", "96", "102", "110", "118", "128"],
            "largo": ["62", "64", "66", "68", "70", "72"]
        }
    },

    # 06 - Lencería y Pijamas
    {
        "folder": "06 - Lenceria y Pijamas Femeninas",
        "file": "Molde_Bralette_Encaje_Copas.pdf",
        "title": "Bralette de Encaje Elástico con Copas Triangulares",
        "category": "Lencería y Pijamas",
        "code": "LEN-01",
        "fabric": "Encaje elástico de 18 cm con onda, blonda elástica, microfibra y elástico picot.",
        "consumption": "1.50 m de encaje elástico con onda + 1.20 m de elástico bajo busto.",
        "difficulty": "Intermedio (Nivel 2/5)",
        "time_est": "1.5 horas",
        "steps": [
            "Corta las copas triangulares aprovechando las ondas del encaje en el escote.",
            "Une las dos piezas de cada copa con costura recta elastizada o zigzag fino de 2.5 mm.",
            "Pega elástico picot afelpado en las sisas estirando suavemente (1 cm cada 10 cm).",
            "Cose tirantes elásticos graduables con aros y correderas metálicas número 10.",
            "Une las copas a la base de elástico bajo busto afelpado.",
            "Cierra la espalda con broche de sostén de 2 ganchos o elástico continuo.",
            "Remata con puntadas decorativas en las uniones."
        ],
        "measurements": {
            "busto": ["78-82 (32B)", "82-86 (34B)", "86-92 (36B)", "92-98 (38B)", "98-104 (40B)", "104-110 (42B)"],
            "cintura": ["60-64", "64-68", "68-74", "74-80", "80-88", "88-96"],
            "cadera": ["-", "-", "-", "-", "-", "-"],
            "largo": ["Copa 14", "15", "16.5", "18", "19.5", "21"]
        }
    },
    {
        "folder": "06 - Lenceria y Pijamas Femeninas",
        "file": "Molde_Panty_Tiro_Alto_Algodon.pdf",
        "title": "Panty Clásico Tiro Alto en Algodón con Elástico Picot",
        "category": "Lencería y Pijamas",
        "code": "LEN-02",
        "fabric": "Algodón licra 95/5, modal elástico, punto jersey orgánico.",
        "consumption": "0.40 m (ancho 1.50 m).",
        "difficulty": "Fácil (Nivel 1/5)",
        "time_est": "45 minutos",
        "steps": [
            "Corta delantero, trasero y mariposa/refuerzo higiénico en algodón 100%.",
            "Ensambla el puente o mariposa ensanguchando las costuras delanteras y traseras para que no rocen la piel.",
            "Pega elástico picot en las piernas con puntada tres pasos (zigzag múltiple).",
            "Cierra un costado.",
            "Pega elástico picot en la cintura.",
            "Cierra el segundo costado y refuerza los extremos.",
            "Planchado suave con vapor."
        ],
        "measurements": {
            "busto": ["-", "-", "-", "-", "-", "-"],
            "cintura": ["60", "64", "70", "76", "84", "92"],
            "cadera": ["88", "92", "98", "104", "112", "120"],
            "largo": ["28", "29", "30", "31", "32", "33"]
        }
    },
    {
        "folder": "06 - Lenceria y Pijamas Femeninas",
        "file": "Molde_BabyDoll_Encaje.pdf",
        "title": "BabyDoll de Tul y Encaje con Copas Suaves",
        "category": "Lencería y Pijamas",
        "code": "LEN-03",
        "fabric": "Tul ilusión, blonda elástica, gasa translúcida o satén fino.",
        "consumption": "1.20 m tul + 0.50 m encaje.",
        "difficulty": "Intermedio (Nivel 2/5)",
        "time_est": "2 horas",
        "steps": [
            "Arma copas superiores en encaje con forro suave.",
            "Une cuerpo inferior evasé de tul fruncido bajo el busto.",
            "Instala elástico suave bajo busto.",
            "Pega tirantes de satén ajustables en la espalda.",
            "Cierra costados con costura francesa fina de 3 mm.",
            "Remata el bajo con encaje al tono o dobladillo roulé.",
            "Coloca lazo decorativo central en el escote."
        ],
        "measurements": {
            "busto": ["82", "86", "92", "98", "106", "114"],
            "cintura": ["64", "68", "74", "80", "88", "96"],
            "cadera": ["92", "96", "102", "108", "116", "124"],
            "largo": ["70", "72", "74", "76", "78", "80"]
        }
    },
    {
        "folder": "06 - Lenceria y Pijamas Femeninas",
        "file": "Molde_Pijama_Camisera_2_Piezas_Saten.pdf",
        "title": "Pijama Camisera 2 Piezas en Satén con Vivo a Contraste",
        "category": "Lencería y Pijamas",
        "code": "LEN-04",
        "fabric": "Satén de seda, satén spandex de alta densidad o seda francesa.",
        "consumption": "2.50 m (ancho 1.50 m) para camisa y short.",
        "difficulty": "Avanzado (Nivel 3/5)",
        "time_est": "4 horas",
        "steps": [
            "Confecciona el vivo o piping a contraste para solapas, puños y bolsillo de pecho.",
            "Pega vivo en cuello y solapa camisera.",
            "Une hombros y mangas con costura francesa impecable.",
            "Instala bolsillo con vivo.",
            "Cierra costados y dobladillos de camisa.",
            "Arma el short de pijama con elástico embutido en cintura y vivo en el bajo.",
            "Abre ojales y cose botones forrados o de nácar."
        ],
        "measurements": {
            "busto": ["86", "90", "96", "102", "110", "118"],
            "cintura": ["66", "70", "76", "82", "90", "98"],
            "cadera": ["94", "98", "104", "110", "118", "126"],
            "largo": ["Camisa 60/Short 36", "61/37", "62/38", "63/39", "64/40", "65/41"]
        }
    },

    # 07 - Moda Infantil
    {
        "folder": "07 - Moda Infantil y Ropa de Ninos",
        "file": "Molde_Vestido_Nina_Princesa_Talla_2_a_10.pdf",
        "title": "Vestido de Niña Princesa con Falda Amplia (Tallas 2 a 10)",
        "category": "Moda Infantil",
        "code": "INF-01",
        "fabric": "Popelina estampada 100% algodón, piqué, organza o tul suave.",
        "consumption": "1.20 m para tallas 2-4; 1.80 m para tallas 6-10.",
        "difficulty": "Intermedio (Nivel 2/5)",
        "time_est": "2.5 horas",
        "steps": [
            "Forra completamente el cuerpo superior para evitar rozaduras en la piel sensible de las niñas.",
            "Une hombros y sisas embonadas.",
            "Frunce la falda con triple puntada de frunce hasta que coincida con el contorno de cintura.",
            "Inserta lazo ancho de satén en los costados para hacer moño en la espalda.",
            "Cierra cremallera invisible en espalda.",
            "Dobladillo amplio de 4 cm en la falda.",
            "Plancha con cuidado."
        ],
        "measurements": {
            "busto": ["T2: 52", "T4: 56", "T6: 60", "T8: 64", "T10: 68", "T12: 72"],
            "cintura": ["50", "53", "56", "58", "60", "63"],
            "cadera": ["54", "58", "63", "68", "73", "78"],
            "largo": ["48", "54", "60", "68", "75", "82"]
        }
    },
    {
        "folder": "07 - Moda Infantil y Ropa de Ninos",
        "file": "Molde_Pantalon_Nino_Dril.pdf",
        "title": "Pantalón de Niño en Dril con Cintura Ajustable",
        "category": "Moda Infantil",
        "code": "INF-02",
        "fabric": "Dril de algodón, gabardina infantil o lino pre-lavado.",
        "consumption": "0.90 m para tallas 2-6; 1.20 m para 8-10.",
        "difficulty": "Intermedio (Nivel 2/5)",
        "time_est": "2.5 horas",
        "steps": [
            "Confecciona bolsillos delanteros diagonales reforzados con remache.",
            "Arma tiro y entrepierna con costura reforzada.",
            "Inserta elástico ojalado en la pretina interior con 2 botones de graduación para que crezca con el niño.",
            "Monta bragueta con cremallera o cierre de velcro.",
            "Dobladillo a 2.5 cm en las botas.",
            "Planchado de quiebre."
        ],
        "measurements": {
            "busto": ["-", "-", "-", "-", "-", "-"],
            "cintura": ["T2: 50", "T4: 53", "T6: 56", "T8: 58", "T10: 60", "T12: 63"],
            "cadera": ["56", "60", "65", "70", "75", "80"],
            "largo": ["48", "56", "65", "74", "82", "90"]
        }
    },
    {
        "folder": "07 - Moda Infantil y Ropa de Ninos",
        "file": "Molde_Conjunto_Bebe_Mameluco.pdf",
        "title": "Mameluco Enterizo para Bebé con Broches en Entrepierna",
        "category": "Moda Infantil",
        "code": "INF-03",
        "fabric": "Punto interlock 100% algodón orgánico, algodón pima o plush.",
        "consumption": "0.60 m (ancho 1.50 m).",
        "difficulty": "Fácil (Nivel 1/5)",
        "time_est": "1.5 horas",
        "steps": [
            "Corta cuello cruzado americano fácil de poner por la cabeza del bebé.",
            "Ribetea cuello y piernas con sesgo elástico de algodón suave.",
            "Une costados y mangas en máquina overlock.",
            "Coloca cinta con broches a presión (snaps libres de níquel) en la entrepierna para cambio rápido de pañal.",
            "Remata puños de mangas.",
            "Planchado con vapor desinfectante."
        ],
        "measurements": {
            "busto": ["0-3M: 40", "3-6M: 44", "6-9M: 47", "9-12M: 50", "12-18M: 52", "18-24M: 54"],
            "cintura": ["41", "45", "48", "50", "52", "53"],
            "cadera": ["42", "46", "49", "51", "53", "55"],
            "largo": ["36", "40", "44", "48", "52", "56"]
        }
    },

    # 08 - Mascotas
    {
        "folder": "08 - Ropa para Mascotas (Perros y Gatos)",
        "file": "Molde_Capa_Impermeable_Perro_Tallas_S_a_XL.pdf",
        "title": "Capa Impermeable para Perro con Cierre de Velcro",
        "category": "Ropa para Mascotas",
        "code": "PET-01",
        "fabric": "Tela impermeable taslan, nylon ripstop y forro térmico polar.",
        "consumption": "0.60 m tela impermeable + 0.60 m polar.",
        "difficulty": "Fácil (Nivel 1/5)",
        "time_est": "1 hora",
        "steps": [
            "Corta el lomo principal en impermeable y forro.",
            "Corta la pechera anatómica con cierre de velcro ajustable.",
            "Deja abertura de ojal reforzado en el lomo para enganchar la correa al arnés.",
            "Cose vivos reflectivos en los bordes para paseos nocturnos seguros.",
            "Embona tela impermeable con forro polar dejando 8 cm para voltear.",
            "Pespunte perimetral de asentado y coloca velcros anchos de 4 cm."
        ],
        "measurements": {
            "busto": ["S: 32-38", "M: 40-46", "L: 48-56", "XL: 58-68", "XXL: 70-82", "Gigante: 85+"],
            "cintura": ["24-30", "30-36", "38-44", "46-54", "56-66", "70+"],
            "cadera": ["-", "-", "-", "-", "-", "-"],
            "largo": ["24", "30", "38", "46", "55", "65"]
        }
    },
    {
        "folder": "08 - Ropa para Mascotas (Perros y Gatos)",
        "file": "Molde_Buzo_Invierno_Mascota.pdf",
        "title": "Buzo de Invierno con Capucha para Mascotas",
        "category": "Ropa para Mascotas",
        "code": "PET-02",
        "fabric": "Fleece térmico, algodón perchado o franela elástica.",
        "consumption": "0.50 m de tela.",
        "difficulty": "Fácil (Nivel 1/5)",
        "time_est": "1 hora",
        "steps": [
            "Une hombros de la prenda.",
            "Pega cuello o capucha con rib.",
            "Pega las mangas cortas delanteras.",
            "Cierra costados dejando amplia curvatura en el vientre para que el perro no se ensucie al orinar.",
            "Remata el contorno inferior y patitas con rib elástico acanalado."
        ],
        "measurements": {
            "busto": ["S: 34", "M: 42", "L: 50", "XL: 60", "XXL: 72", "3XL: 84"],
            "cintura": ["26", "32", "40", "48", "58", "68"],
            "cadera": ["-", "-", "-", "-", "-", "-"],
            "largo": ["22", "28", "36", "44", "52", "62"]
        }
    },

    # 09 - Bolsos y Accesorios
    {
        "folder": "09 - Bolsos, Cartucheras y Accesorios",
        "file": "Molde_Bolso_Tote_Bag_Lona.pdf",
        "title": "Bolso Tote Bag de Lona con Bolsillo Interno y Forro",
        "category": "Bolsos y Accesorios",
        "code": "ACC-01",
        "fabric": "Lona de algodón, dril pesado, lona costeña, denim o cordura.",
        "consumption": "0.80 m tela principal + 0.60 m forro.",
        "difficulty": "Fácil (Nivel 1/5)",
        "time_est": "1.5 horas",
        "steps": [
            "Corta 2 cuerpos principales de 42 x 38 cm en lona y 2 en forro.",
            "Corta 2 tiras de 65 x 8 cm para las asas dobles reforzadas.",
            "Cose y plancha las asas pespuntando por ambos filos.",
            "Prepara y pega el bolsillo interno con cremallera en el forro.",
            "Cierra los costados y el fondo del bolso exterior.",
            "Forma la base con fuelles en las esquinas de 6 cm para darle fondo y volumen al bolso.",
            "Une exterior y forro colocando las asas entre ambas telas, voltea por abertura de 10 cm y pespunte superior de carga."
        ],
        "measurements": {
            "busto": ["-", "-", "-", "-", "-", "-"],
            "cintura": ["-", "-", "-", "-", "-", "-"],
            "cadera": ["-", "-", "-", "-", "-", "-"],
            "largo": ["Alto: 42 cm", "Ancho: 38 cm", "Fuelle: 10 cm", "Asas: 65 cm", "Bolsillo: 20x16", "Capacidad: 15L"]
        }
    },
    {
        "folder": "09 - Bolsos, Cartucheras y Accesorios",
        "file": "Molde_Cartuchera_Neceser_Cremallera.pdf",
        "title": "Cartuchera y Neceser Multiusos con Fuelle Prismático",
        "category": "Bolsos y Accesorios",
        "code": "ACC-02",
        "fabric": "Lona plastificada, cordura, ecocuero o tela acolchada.",
        "consumption": "0.40 m tela + cremallera fija de 25 cm.",
        "difficulty": "Fácil (Nivel 1/5)",
        "time_est": "45 minutos",
        "steps": [
            "Pega cremallera entre la tela exterior y el forro en ambos lados.",
            "Pasa pespunte de asentado a 2 mm del borde de la cremallera.",
            "Abre la cremallera a la mitad antes de cerrar los extremos.",
            "Cierra los laterales y remata con sesgo pulido.",
            "Corta y cose las esquinas en ángulo recto para formar la caja prismática.",
            "Voltea al derecho por la cremallera y saca bien las esquinas."
        ],
        "measurements": {
            "busto": ["-", "-", "-", "-", "-", "-"],
            "cintura": ["-", "-", "-", "-", "-", "-"],
            "cadera": ["-", "-", "-", "-", "-", "-"],
            "largo": ["Largo: 22 cm", "Alto: 12 cm", "Ancho base: 8 cm", "Cremallera: 25 cm", "-", "-"]
        }
    },
    {
        "folder": "09 - Bolsos, Cartucheras y Accesorios",
        "file": "Molde_Mochila_Casual.pdf",
        "title": "Mochila Casual Urbana con Bolsillo Frontal 3D",
        "category": "Bolsos y Accesorios",
        "code": "ACC-03",
        "fabric": "Lona impermeable, cordura 600D, forro de nylon tafetán y espuma acolchada.",
        "consumption": "1.10 m lona + cremallera gruesa de nylon #5.",
        "difficulty": "Avanzado (Nivel 3/5)",
        "time_est": "4 horas",
        "steps": [
            "Arma el bolsillo frontal con fuelle tridimensional y cremallera curva.",
            "Prepara las correas de hombro acolchándolas con espuma de 5 mm y cinta reata militar.",
            "Fija las correas y el asa de mano en el panel trasero.",
            "Confecciona el fuelle perimetral con cremallera principal de doble carro.",
            "Une panel frontal, fuelle y panel trasero embonando con ribete o vivo plástico.",
            "Remata costuras interiores con sesgo de nylon para que no deshilache.",
            "Voltea y plancha al vapor."
        ],
        "measurements": {
            "busto": ["-", "-", "-", "-", "-", "-"],
            "cintura": ["-", "-", "-", "-", "-", "-"],
            "cadera": ["-", "-", "-", "-", "-", "-"],
            "largo": ["Alto: 40 cm", "Ancho: 30 cm", "Profundidad: 14 cm", "Volumen: 18L", "-", "-"]
        }
    },
    # 10 - Uniformes y Ropa de Trabajo
    {
        "folder": "10 - Uniformes de Trabajo, Batas y Delantales",
        "file": "Molde_Uniforme_Scrub_Medico_Antifluidos.pdf",
        "title": "Uniforme Quirúrgico Scrub Médico Antifluidos",
        "category": "Uniformes y Ropa de Trabajo",
        "code": "UNI-01",
        "fabric": "Antifluido universal strech (Lafayette o similar), dril médico o microfibra.",
        "consumption": "2.60 m total (1.20 m filipina + 1.40 m pantalón, ancho 1.50 m).",
        "difficulty": "Intermedio (Nivel 2/5)",
        "time_est": "3 horas y 30 minutos",
        "steps": [
            "Corta el delantero con escote en V reforzado y remata con vista interna fusionada.",
            "Confecciona bolsillos de parche dobles en la filipina con atraques de seguridad en esquinas.",
            "Une hombros y costados de la filipina con costura francesa o fileteadora de 4 hilos.",
            "Monta las mangas cortas y realiza pespunte decorativo al canto en sisas.",
            "Arma el pantalón uniendo tiros, costados y entrepierna con puntada de seguridad reforzada.",
            "Inserta elástico de 4 cm en pretina y añade cordón de ajuste interno.",
            "Cose dobladillos inferiores de 2.5 cm en filipina y pantalón, y plancha al vapor."
        ],
        "measurements": {
            "busto": ["86-90", "91-96", "97-102", "103-108", "109-115", "116-122"],
            "cintura": ["66-70", "71-76", "77-82", "83-88", "89-95", "96-102"],
            "cadera": ["92-96", "97-102", "103-108", "109-114", "115-121", "122-128"],
            "largo": ["70 cm", "72 cm", "74 cm", "76 cm", "78 cm", "80 cm"]
        }
    },
    {
        "folder": "10 - Uniformes de Trabajo, Batas y Delantales",
        "file": "Molde_Delantal_Barista_Chef_Pechera.pdf",
        "title": "Delantal Profesional Barista y Chef con Pechera",
        "category": "Uniformes y Ropa de Trabajo",
        "code": "UNI-02",
        "fabric": "Lona pesada de algodón (10 a 12 oz), Dril grueso o Denim índigo con detalles en ecocuero.",
        "consumption": "0.95 m (ancho 1.50 m) + 3.2 m de cinta reata de algodón de 2.5 cm.",
        "difficulty": "Fácil / Principiante (Nivel 1/5)",
        "time_est": "1 hora y 45 minutos",
        "steps": [
            "Corta el cuerpo del delantal con pechera al doblez de la lona respetando aplomos.",
            "Realiza dobladillo doble de 1.2 cm en todo el contorno perimetral con puntada reforzada.",
            "Confecciona bolsillo frontal multifunción con división para lápiz, libreta y celular.",
            "Fija refuerzos triangulares en ecocuero o remaches metálicos en las esquinas superiores del bolsillo.",
            "Instala ojales metálicos inoxidables o pasadores reforzados en la pechera y en la cintura.",
            "Pasa las cintas reata cruzadas en X por la espalda para descanso ergonómico del cuello.",
            "Planchado final con apresto para lona."
        ],
        "measurements": {
            "busto": ["Universal", "Universal", "Universal", "Universal", "Universal", "Universal"],
            "cintura": ["Universal", "Universal", "Universal", "Universal", "Universal", "Universal"],
            "cadera": ["Universal", "Universal", "Universal", "Universal", "Universal", "Universal"],
            "largo": ["Alto: 85 cm", "Ancho pechera: 28 cm", "Ancho base: 75 cm", "Tiras: 160 cm", "Bolsillo: 32x20", "Ajustable"]
        }
    }
]

# -------------------------------------------------------------
# DICCIONARIO DE LOS 4 BONOS EXCLUSIVOS VIP (Categoría 10)
# -------------------------------------------------------------
BONOS = [
    {
        "file": "01_Catalogo_Maestro_2000_Moldes.pdf",
        "title": "Catálogo Maestro · Mega Pack 2.000 Moldes",
        "subtitle": "Índice técnico integral de las 10 colecciones, especificaciones de corte, niveles de dificultad, tablas comparativas y planificador de taller.",
        "pages": [
            {
                "title": "1. Estructura y Organización de las 10 Colecciones",
                "body": """
                <p class="lead">El <b>Mega Pack de 2.000 Moldes y Patrones de Costura</b> es la biblioteca digital de confección más completa en idioma español. Diseñada tanto para emprendedoras independientes que confeccionan en casa como para talleres de confección industrial y modistas profesionales.</p>
                <div class="grid2">
                  <div class="card">
                    <h4>01. Vestidos Casuales y de Fiesta</h4>
                    <p>Patrones de vestidos cortos, midi, camiseros, maxi vestidos de gala y cortes sirena desde talla XS hasta XXL con holguras calibradas.</p>
                  </div>
                  <div class="card">
                    <h4>02. Blusas, Tops y Camisería</h4>
                    <p>Camisería clásica con cuello y puños, blusas sueltas campesinas, tops cruzados y cortes asimétricos con costura francesa.</p>
                  </div>
                  <div class="card">
                    <h4>03. Pantalones, Palazzos y Shorts</h4>
                    <p>Pantalones sastre de vestir con bragueta, palazzos anchos tiro alto, bermudas y shorts playeros con pinzas anatómicas.</p>
                  </div>
                  <div class="card">
                    <h4>04. Faldas y Conjuntos de 2 Piezas</h4>
                    <p>Faldas tubo lápiz, faldas circulares plato, plisadas, minifaldas cruzadas y coordinados modernos para producción comercial.</p>
                  </div>
                  <div class="card">
                    <h4>05. Ropa Deportiva y Activewear</h4>
                    <p>Leggings sin costura lateral, tops deportivos con compresión, sudaderas joggers unisex y chaquetas con capucha.</p>
                  </div>
                  <div class="card">
                    <h4>06. Lencería y Pijamas Femeninas</h4>
                    <p>Bralettes de encaje elastizado, pantys clásicos e higiénicos en algodón, babydolls en tul y pijamas camiseras en satén.</p>
                  </div>
                </div>
                """
            },
            {
                "title": "2. Mapa de Producción y Niveles de Dificultad",
                "body": """
                <p>Cada patrón cuenta con una clasificación técnica que te permite organizar tu línea de costura según la complejidad y el tipo de maquinaria requerida:</p>
                <table class="t">
                  <thead>
                    <tr><th>Nivel</th><th>Categoría</th><th>Maquinaria Requerida</th><th>Tiempo Promedio</th><th>Margen Sugerido</th></tr>
                  </thead>
                  <tbody>
                    <tr><td><b>Nivel 1 (Principiante)</b></td><td>Faldas rectas, tops básicos, cartucheras, capas de mascota</td><td>Máquina familiar básica (puntada recta y zigzag)</td><td>1 a 2 horas</td><td>60% a 70%</td></tr>
                    <tr><td><b>Nivel 2 (Intermedio)</b></td><td>Vestidos casuales, palazzos, lencería, leggings</td><td>Plana + Remalladora (fileteadora de 3 o 4 hilos)</td><td>2 a 3.5 horas</td><td>65% a 75%</td></tr>
                    <tr><td><b>Nivel 3 (Avanzado)</b></td><td>Camisas de vestir, vestidos camiseros, mochilas</td><td>Plana industrial, pie de dobladillo, prensatelas de vivo</td><td>4 a 5 horas</td><td>70% a 80%</td></tr>
                    <tr><td><b>Nivel 4 (Alta Costura)</b></td><td>Vestidos de fiesta maxi, satenes, terciopelos con forro</td><td>Máquina plana con arrastre suave, plancha de teflón al vapor</td><td>5 a 8 horas</td><td>80% a 150%</td></tr>
                  </tbody>
                </table>
                <div class="nota">
                  <b>Recomendación para Emprender:</b> Si vas a iniciar tu negocio de venta de ropa por redes sociales, comienza comercializando <b>Palazzos Tiro Alto</b> y <b>Tops Cruzados</b>. Son prendas de corte rápido, excelente margen comercial (superior al 65%) y ajuste elástico tolerante en tallas.
                </div>
                """
            }
        ]
    },
    {
        "file": "02_Manual_Tecnico_Escalamiento_y_Medidas.pdf",
        "title": "Manual Técnico de Escalamiento y Medidas",
        "subtitle": "Graduación anatómica proporcional de patrones de talla XS a XXL, toma de medidas corporales y correcciones de calce en taller.",
        "pages": [
            {
                "title": "1. Antropometría y Toma de Medidas Anatómicas",
                "body": """
                <p class="lead">Un patrón bien graduado garantiza que la prenda siente perfecta en cualquier silueta sin deformar los aplomos ni tirar de los hombros.</p>
                <table class="t">
                  <thead>
                    <tr><th>Punto Anatómico</th><th>Cómo Medir Correctamente</th><th>Tolerancia / Holgura</th></tr>
                  </thead>
                  <tbody>
                    <tr><td><b>Contorno de Busto</b></td><td>Pasa la cinta métrica horizontalmente por la parte más prominente del pecho y omóplatos, sin apretar.</td><td>+ 2 a 4 cm holgura</td></tr>
                    <tr><td><b>Contorno de Cintura</b></td><td>Mide la parte más estrecha del torso (generalmente 2 a 3 cm por encima del ombligo).</td><td>+ 1 a 2 cm holgura</td></tr>
                    <tr><td><b>Contorno de Cadera</b></td><td>Mide sobre la parte más sobresaliente de los glúteos manteniendo los pies juntos.</td><td>+ 3 a 5 cm holgura</td></tr>
                    <tr><td><b>Talle Delantero</b></td><td>Desde la unión del cuello con el hombro, pasando por el pezón hasta la línea de cintura.</td><td>Exacta sin holgura</td></tr>
                    <tr><td><b>Largo de Manga</b></td><td>Desde el hueso del hombro (acromion) doblando el codo en ángulo de 90° hasta la muñeca.</td><td>+ 1.5 cm holgura</td></tr>
                  </tbody>
                </table>
                <div class="alerta">
                  <b>Importante al Tomar Medidas:</b> La persona debe vestir ropa ligera o ropa interior adecuada y mantener postura erguida natural. La cinta métrica debe quedar nivelada horizontalmente en todo el perímetro del cuerpo.
                </div>
                """
            },
            {
                "title": "2. Reglas Maestras de Escalamiento Industrial (Grados de Salto)",
                "body": """
                <p>El escalamiento de patrones no consiste en agrandar el dibujo con una fotocopiadora. Cada punto del patrón se desplaza según vectores anatómicos normalizados:</p>
                <div class="grid2">
                  <div class="card">
                    <h4>Incremento en Contornos (+4 cm por talla)</h4>
                    <p>Entre cada talla (de XS a S, de S a M, etc.), el contorno corporal total aumenta <b>4.0 cm</b>. Como el patrón representa 1/4 del cuerpo (delantero o espalda al doblez), cada costado exterior se desplaza horizontalmente <b>1.0 cm</b> hacia afuera.</p>
                  </div>
                  <div class="card">
                    <h4>Incremento en Largos (+0.5 a 1.0 cm por talla)</h4>
                    <p>El talle delantero y la altura de sisa aumentan <b>0.5 cm</b> por talla para evitar que la sisa quede ajustada bajo la axila. El largo total de falda o pantalón aumenta entre <b>1.0 cm y 1.5 cm</b> por talla.</p>
                  </div>
                </div>
                <div class="test-box">
                  <b style="color: #0c1b33;">ESCALA DE CONTROL</b>
                  <span style="font-size: 14pt; font-weight: bold; color: #b08442; margin: 3px 0;">50 x 50 mm</span>
                  <span style="font-size: 7.5pt; color: #64748b;">Verifica con tu regla antes de graduar.</span>
                </div>
                """
            }
        ]
    },
    {
        "file": "03_Guia_Impresion_Hoja_Carta_y_Armado.pdf",
        "title": "Guía Paso a Paso de Impresión y Armado",
        "subtitle": "Cómo imprimir tus patrones en hoja carta o A4 en cualquier impresora doméstica, corte de márgenes y ensamblado sin desfasar líneas.",
        "pages": [
            {
                "title": "1. Configuración de Impresión al 100% Sin Escala",
                "body": """
                <p class="lead">Para que un molde digital mantenga su precisión milimétrica al imprimirse en hojas tamaño carta estándar, es indispensable desactivar cualquier ajuste automático de la impresora:</p>
                <div class="grid3">
                  <div class="card">
                    <h4>Paso 1: Abre en Adobe Reader</h4>
                    <p>Recomendamos abrir el archivo PDF directamente con Adobe Acrobat Reader (gratuito) o desde Google Chrome.</p>
                  </div>
                  <div class="card">
                    <h4>Paso 2: Escala al 100%</h4>
                    <p>En el cuadro de diálogo de impresión, marca la casilla <b>"Tamaño Real"</b> o introduce <b>"Escala: 100%"</b> en escala personalizada.</p>
                  </div>
                  <div class="card">
                    <h4>Paso 3: Mide el Cuadro</h4>
                    <p>Imprime primero la página que contiene el cuadro de control de 5x5 cm. Mídelo con tu regla antes de imprimir el resto.</p>
                  </div>
                </div>
                <div class="alerta">
                  <b>Atención:</b> Jamás uses la opción "Ajustar al área de impresión" ni "Reducir páginas grandes", ya que reducirán el patrón entre un 5% y un 8%, haciendo que la prenda final quede una o dos tallas más pequeña.
                </div>
                """
            },
            {
                "title": "2. Unión de Hojas Estilo Rompecabezas (Fila por Fila)",
                "body": """
                <p>Nuestros pliegos de patrones cuentan con marcas perimetrales de cruces de registro (✛) y coordenadas alfanuméricas (A1, A2, A3... B1, B2, B3...):</p>
                <ol style="margin-left: 18px; line-height: 1.7;">
                  <li><b>Corte de pestañas:</b> Utiliza una tijera o regla y cúter para cortar únicamente el margen <b>derecho e inferior</b> de cada hoja impresa. Deja intactos los márgenes superior e izquierdo para usarlos como base de pegado.</li>
                  <li><b>Ensamble de la Fila A:</b> Alinea la hoja A1 con la hoja A2 haciendo coincidir exactamente las cruces de registro de las esquinas. Pega con trozos pequeños de cinta adhesiva transparente. Continúa con A3 y A4.</li>
                  <li><b>Ensamble de la Fila B:</b> Une las hojas B1, B2, B3 siguiendo el mismo procedimiento.</li>
                  <li><b>Unión horizontal de filas:</b> Monta el borde inferior de la Fila A sobre el borde superior de la Fila B haciendo coincidir las líneas continuas del patrón.</li>
                  <li><b>Fijación definitiva:</b> Pasa cinta adhesiva a lo largo de todas las uniones por ambas caras y procede a cortar el patrón por la línea correspondiente a tu talla.</li>
                </ol>
                """
            }
        ]
    },
    {
        "file": "04_Diccionario_Textil_y_Guia_de_Agujas.pdf",
        "title": "Diccionario Textil y Guía de Agujas",
        "subtitle": "Enciclopedia de telas planas y elásticas, equivalencias de agujas Schmetz/Singer, tipos de hilos y calibración de tensiones en taller.",
        "pages": [
            {
                "title": "1. Clasificación de Telas: Planas vs Tejido de Punto",
                "body": """
                <p class="lead">Elegir la tela equivocada para un patrón es la causa principal de fallos en confección. Conoce las dos grandes familias textiles:</p>
                <table class="t">
                  <thead>
                    <tr><th>Tipo de Tejido</th><th>Comportamiento</th><th>Ejemplos Comerciales</th><th>Aguja y Puntada Requerida</th></tr>
                  </thead>
                  <tbody>
                    <tr><td><b>Tejido Plano (Rígido)</b></td><td>Hilos de urdimbre y trama entrelazados. No estira (a menos que tenga spandex). Caída estructurada.</td><td>Lino, popelina, dril, gabardina, satén, crepé marroquí, paño, chifón, tafetán.</td><td>Aguja <b>Universal</b> o <b>Microtex</b> (70/10 a 90/14). Puntada recta estándar 2.5 mm.</td></tr>
                    <tr><td><b>Tejido de Punto (Elástico)</b></td><td>Mallas o bucles entrelazados. Estira en ancho y largo. Se adapta al cuerpo sin pinzas.</td><td>Lycra, suplex deportivo, rib acanalado, interlock, modal, jersey de algodón, fleece.</td><td>Aguja <b>Punta de Bola (Ball Point)</b> o <b>Stretch</b>. Costura zigzag, remalladora o aguja gemela.</td></tr>
                  </tbody>
                </table>
                """
            },
            {
                "title": "2. Guía Universal de Agujas e Hilos",
                "body": """
                <p>Utiliza siempre la aguja adecuada al grosor y tipo de tejido para evitar saltos de puntada o perforaciones visibles en la tela:</p>
                <div class="grid3">
                  <div class="card">
                    <h4>Telas Livianas (Seda, Chifón, Tul)</h4>
                    <p><b>Aguja:</b> Universal o Microtex N° 60/8 a 70/10.<br><b>Hilo:</b> Poliéster fino 120 o seda.<br><b>Tensión:</b> Media-baja (3.0 a 3.5).</p>
                  </div>
                  <div class="card">
                    <h4>Telas Medianas (Lino, Popelina, Crepé)</h4>
                    <p><b>Aguja:</b> Universal N° 80/12 o 90/14.<br><b>Hilo:</b> Poliéster 40/2 estándar.<br><b>Tensión:</b> Estándar (4.0 a 4.5).</p>
                  </div>
                  <div class="card">
                    <h4>Telas Gruesas (Jeans, Dril, Lonas)</h4>
                    <p><b>Aguja:</b> Jeans / Denim N° 100/16 a 110/18.<br><b>Hilo:</b> Hilo torzal para pespunte + hilo 40/2 abajo.<br><b>Tensión:</b> Media-alta (5.0 a 6.0).</p>
                  </div>
                </div>
                <div class="nota">
                  <b>Consejo de Vida Útil de la Aguja:</b> Cambia la aguja de tu máquina de coser cada 8 a 10 horas de costura continua. Una aguja con la punta despuntada rompe las fibras del tejido y descalibra el garfio de la máquina.
                </div>
                """
            }
        ]
    }
]

def compile_pdf(html_path, pdf_path):
    cmd = [
        CHROME_SHELL,
        "--no-sandbox",
        f"--print-to-pdf={pdf_path}",
        html_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error compilando {pdf_path}: {res.stderr}")
        return False
    return True

def main():
    print("=" * 60)
    print("Iniciando Generación Editorial del Mega Pack de Moldes 2026")
    print("=" * 60)

    from concurrent.futures import ThreadPoolExecutor

    tmp_dir = "/tmp/moldes_build"
    os.makedirs(tmp_dir, exist_ok=True)

    tasks = []

    # 1. Preparar HTMLs de los 34 patrones
    print(f"\n[1/3] Preparando HTMLs de 34 Patrones Técnicos Graduados XS-XXL...")
    for idx, p in enumerate(PATTERNS, 1):
        html_content = build_molde_html(
            title=p['title'],
            category=p['category'],
            code=p['code'],
            fabric=p['fabric'],
            consumption=p['consumption'],
            difficulty=p['difficulty'],
            time_est=p['time_est'],
            steps=p['steps'],
            measurements=p['measurements']
        )
        base_name = p['file'].replace(".pdf", "")
        html_file = os.path.join(tmp_dir, f"{base_name}.html")
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(html_content)
        
        pdf_tmp = os.path.join(tmp_dir, p['file'])
        target_drive = os.path.join(DRIVE_DIR, p['folder'], p['file'])
        target_public = os.path.join(PUBLIC_DIR, p['folder'], p['file'])
        tasks.append((html_file, pdf_tmp, target_drive, target_public, p['file']))

    # 2. Preparar HTMLs de los 4 Bonos VIP
    print(f"[2/3] Preparando HTMLs de 4 Libros Maestros / Bonos VIP...")
    bono_folder = "11 - BONOS EXCLUSIVOS (Guias Tecnicas y Calculadora)"
    for idx, b in enumerate(BONOS, 1):
        html_content = build_bono_html(b['title'], b['subtitle'], b['pages'])
        base_name = b['file'].replace(".pdf", "")
        html_file = os.path.join(tmp_dir, f"{base_name}.html")
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(html_content)
        
        pdf_tmp = os.path.join(tmp_dir, b['file'])
        target_drive = os.path.join(DRIVE_DIR, bono_folder, b['file'])
        target_public = os.path.join(PUBLIC_DIR, bono_folder, b['file'])
        tasks.append((html_file, pdf_tmp, target_drive, target_public, b['file']))

    # Copiar Calculadora de Confección en Excel a la carpeta de bonos
    calc_src = os.path.join(BASE_DIR, "moldes-pack", "bonos", "Calculadora_Costos_Confeccion_2026.xlsx")
    if os.path.exists(calc_src):
        for b_f in [bono_folder, "10 - BONOS EXCLUSIVOS (Guias Tecnicas y Calculadora)"]:
            os.makedirs(os.path.join(DRIVE_DIR, b_f), exist_ok=True)
            os.makedirs(os.path.join(PUBLIC_DIR, b_f), exist_ok=True)
            shutil.copyfile(calc_src, os.path.join(DRIVE_DIR, b_f, "Calculadora_Costos_Confeccion_2026.xlsx"))
            shutil.copyfile(calc_src, os.path.join(PUBLIC_DIR, b_f, "Calculadora_Costos_Confeccion_2026.xlsx"))

    def process_task(task):
        html_f, pdf_f, drive_f, public_f, fname = task
        success = compile_pdf(html_f, pdf_f)
        if not success or not os.path.exists(pdf_f) or os.path.getsize(pdf_f) < 50000:
            print(f"  ⚠️ Reintentando {fname}...")
            compile_pdf(html_f, pdf_f)
        
        if not os.path.exists(pdf_f) or os.path.getsize(pdf_f) < 50000:
            print(f"  ❌ ERROR CRÍTICO: {fname} no se pudo compilar correctamente.")
            return fname

        os.makedirs(os.path.dirname(drive_f), exist_ok=True)
        os.makedirs(os.path.dirname(public_f), exist_ok=True)
        shutil.copyfile(pdf_f, drive_f)
        shutil.copyfile(pdf_f, public_f)
        
        # Mantener ambas copias de bonos (10 y 11) para compatibilidad total
        if "BONOS EXCLUSIVOS" in drive_f:
            alt_drive = drive_f.replace("11 - BONOS EXCLUSIVOS", "10 - BONOS EXCLUSIVOS")
            alt_public = public_f.replace("11 - BONOS EXCLUSIVOS", "10 - BONOS EXCLUSIVOS")
            os.makedirs(os.path.dirname(alt_drive), exist_ok=True)
            os.makedirs(os.path.dirname(alt_public), exist_ok=True)
            shutil.copyfile(pdf_f, alt_drive)
            shutil.copyfile(pdf_f, alt_public)
            
        sz = os.path.getsize(pdf_f) // 1024
        print(f"  ✔ {fname} ({sz} KB)")
        return fname

    print(f"\n[3/4] Compilando {len(tasks)} archivos PDF en paralelo con 4 trabajadores...")
    with ThreadPoolExecutor(max_workers=4) as executor:
        list(executor.map(process_task, tasks))

    # 4. Empacar el archivo ZIP completo
    print(f"\n[4/4] Comprimiendo Mega_Pack_2000_Moldes_Costura_2026.zip...")
    zip_drive = os.path.join(DRIVE_DIR, "Mega_Pack_2000_Moldes_Costura_2026.zip")
    zip_public = os.path.join(PUBLIC_DIR, "Mega_Pack_2000_Moldes_Costura_2026.zip")

    with zipfile.ZipFile(zip_public, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(PUBLIC_DIR):
            for file in files:
                if file.endswith('.zip') or file.startswith('.'):
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, PUBLIC_DIR)
                zipf.write(file_path, arcname)

    shutil.copyfile(zip_public, zip_drive)
    zip_size_mb = os.path.getsize(zip_public) / (1024 * 1024)
    print(f"✔ ZIP generado con éxito: {zip_size_mb:.2f} MB")
    print("\n¡Proceso de generación editorial completado al 100%!")

if __name__ == "__main__":
    main()
