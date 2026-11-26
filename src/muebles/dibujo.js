// Dibujos SVG: vista frontal acotada del mueble y diagrama de cortes por tablero.
// Funciona en Node (PDF y portal del comprador) y en el navegador.
(function (root) {
  const T = '#1b2333', OR = '#b07a12', GR = '#8a93a3', FILL = '#f4ece0', PUERTA = '#efe2cc';
  const fmt = (v) => String(Math.round(v * 10) / 10).replace('.', ',');

  function cota(x1, y1, x2, y2, texto, lado = 'arriba', k = 1) {
    const s = 6 * k, fs = 22 * k;
    if (y1 === y2) {
      const y = lado === 'arriba' ? y1 - s * 4 : y1 + s * 4;
      return `<path d="M${x1},${y1} L${x1},${y} M${x2},${y1} L${x2},${y} M${x1},${y} L${x2},${y}" stroke="${OR}" stroke-width="${1.6 * k}" fill="none"/>
        <path d="M${x1},${y} l${s},${-s / 2} l0,${s} Z M${x2},${y} l${-s},${-s / 2} l0,${s} Z" fill="${OR}"/>
        <text x="${(x1 + x2) / 2}" y="${y - s}" font-size="${fs}" text-anchor="middle" fill="${OR}" font-weight="700">${texto}</text>`;
    }
    const x = lado === 'derecha' ? x1 + s * 4 : x1 - s * 4;
    return `<path d="M${x1},${y1} L${x},${y1} M${x1},${y2} L${x},${y2} M${x},${y1} L${x},${y2}" stroke="${OR}" stroke-width="${1.6 * k}" fill="none"/>
      <path d="M${x},${y1} l${-s / 2},${s} l${s},0 Z M${x},${y2} l${-s / 2},${-s} l${s},0 Z" fill="${OR}"/>
      <text x="${x + s * 1.6}" y="${(y1 + y2) / 2}" font-size="${fs}" fill="${OR}" font-weight="700" transform="rotate(90 ${x + s * 1.6} ${(y1 + y2) / 2})" text-anchor="middle">${texto}</text>`;
  }

  function rect(x, y, w, h, fill, stroke = T, sw = 2, extra = '') {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
  }

  function manija(x, y, vertical) {
    return vertical ? `<rect x="${x - 4}" y="${y - 40}" width="8" height="80" rx="4" fill="${T}"/>` : `<rect x="${x - 40}" y="${y - 4}" width="80" height="8" rx="4" fill="${T}"/>`;
  }

  // Vista frontal con frentes superpuestos (lo que se ve con el mueble armado)
  const ESTILO = {
    cuerpo: [FILL, T, 2], frente: [PUERTA, T, 2], frente2: ['#e6d3b3', T, 2], hueco: ['#fffaf2', GR, 1], zocalo: ['#ddd2bf', T, 2],
    oculto: ['#e7dccb', GR, 1.5, 'stroke-dasharray="10 8"'], espejo: ['#e3eef6', '#7d93a8', 2],
  };
  function frente(r, spec) {
    const d = r.dibujo;
    const A = d.A || spec.A, H = d.H || spec.H, e = d.e || 15;
    const o = [];
    const pad = 120;
    if (d.rects) {
      for (const q of d.rects) {
        if (q.t === 'linea') { o.push(q.h ? rect(q.x, q.y, q.w, q.h, T, T, 0) : `<path d="M${q.x},${q.y} L${q.x + q.w},${q.y}" stroke="${GR}" stroke-width="3"/>`); continue; }
        const [f, st, sw, extra] = ESTILO[q.t] || ESTILO.cuerpo;
        o.push(rect(q.x, q.y, q.w, q.h, f, st, sw, extra || ''));
        if (q.m === 'vd') o.push(manija(q.x + q.w - 50, q.y + Math.min(q.h / 2, 900), true));
        if (q.m === 'vi') o.push(manija(q.x + 50, q.y + Math.min(q.h / 2, 900), true));
        if (q.m === 'h') o.push(manija(q.x + q.w / 2, q.y + q.h / 2, false));
      }
    } else if (d.escritorio) {
      o.push(rect(0, 0, A, e, FILL));
      o.push(rect(0, e, e, H - e, FILL), rect(A - e, e, e, H - e, FILL));
      o.push(rect(e, e, A - 2 * e, 350, '#e7dccb', GR, 1.5, 'stroke-dasharray="10 8"'));
      if (d.cajonera) {
        const x0 = A - e - d.cajonera.wc;
        for (let j = 0; j < 3; j++) {
          const y = e + j * (d.cajonera.fh + 3);
          o.push(rect(x0 + 1.5, y + 1.5, d.cajonera.wc - 3, d.cajonera.fh, PUERTA), manija(x0 + d.cajonera.wc / 2, y + d.cajonera.fh / 2, false));
        }
      }
    } else {
      const z = d.zocalo || 0;
      o.push(rect(0, 0, A, H - z, FILL));
      if (z) o.push(rect(e, H - z, A - 2 * e, z, '#ddd2bf'));
      const n = d.comps.length;
      const w = (A - 2 * e - (n - 1) * e) / n;
      let x = e;
      const altoF = H - z - 3;
      d.comps.forEach((c, i) => {
        const izq = i === 0 ? 0 : x - e / 2;
        const der = i === n - 1 ? A : x + w + e / 2;
        const span = der - izq;
        const top = 1.5;
        const shelves = (k, y0, y1) => { for (let s = 1; s <= k; s++) { const yy = y0 + ((y1 - y0) * s) / (k + 1); o.push(`<path d="M${x},${yy} L${x + w},${yy}" stroke="${GR}" stroke-width="3"/>`); } };
        if (c.tipo === 'abierto' && !c.bibPuertas) { o.push(rect(x, e, w, H - z - 2 * e, '#fffaf2', GR, 1)); shelves(c.entrepanos, e, H - z - e); }
        if (c.bibPuertas) {
          const yP = H - z - c.bibPuertas.alto;
          o.push(rect(x, e, w, yP - e, '#fffaf2', GR, 1)); shelves(c.entrepanos, e, yP);
          const k = c.bibPuertas.k, pw = (span - 3 - 3 * (k - 1)) / k;
          for (let j = 0; j < k; j++) { const px = izq + 1.5 + j * (pw + 3); o.push(rect(px, yP + 1.5, pw, c.bibPuertas.alto - 3, PUERTA), manija(j % 2 ? px + 50 : px + pw - 50, yP + 120, true)); }
        }
        if (c.tipo === 'colgar' && !c.puertas) {
          o.push(rect(x, e, w, H - z - 2 * e, '#fffaf2', GR, 1));
          o.push(`<path d="M${x},${e + 400} L${x + w},${e + 400}" stroke="${GR}" stroke-width="3"/><path d="M${x + 10},${e + 460} L${x + w - 10},${e + 460}" stroke="${T}" stroke-width="6"/>`);
          for (let g = 0; g < 4; g++) o.push(`<path d="M${x + 60 + g * (w - 120) / 3},${e + 460} l-30,40 l60,0 Z" fill="none" stroke="${GR}" stroke-width="2"/>`);
        }
        const puertas = (k, y0, alto, sufijoManija = 'abajo') => {
          const pw = (span - 3 - 3 * (k - 1)) / k;
          for (let j = 0; j < k; j++) {
            const px = izq + 1.5 + j * (pw + 3);
            o.push(rect(px, y0, pw, alto, PUERTA));
            const mx = k === 1 ? (i % 2 ? px + 50 : px + pw - 50) : (j % 2 ? px + 50 : px + pw - 50);
            o.push(manija(mx, sufijoManija === 'arriba' ? y0 + alto - 150 : y0 + Math.min(150, alto / 2), true));
          }
        };
        if ((c.tipo === 'puertas' || (c.tipo === 'colgar' && c.puertas)) && !c.bibPuertas) puertas(c.puertas, top, altoF, d.techo === false ? 'abajo' : 'abajo');
        if (c.tipo === 'cajones') {
          const k = c.cajones;
          const base = H - z;
          for (let j = 0; j < k; j++) {
            const y = base - 1.5 - (j + 1) * c.fh - j * 3;
            o.push(rect(izq + 1.5, y, span - 3, c.fh, PUERTA), manija(izq + span / 2, y + c.fh / 2, false));
          }
          if (c.altoZona) {
            const yTop = base - c.altoZona;
            if (c.puertasArriba) puertas(c.puertasArriba, top, yTop - 3, 'arriba');
            else { o.push(rect(x, e, w, yTop - e, '#fffaf2', GR, 1)); shelves(c.entrepanos, e, yTop); }
          }
        }
        if (c.mixto) {
          o.push(rect(izq + 1.5, top, span - 3, c.fhC, PUERTA), manija(izq + span / 2, top + c.fhC / 2, false));
          const y0 = top + c.fhC + 3;
          const k = c.puertas, pw = (span - 3 - 3 * (k - 1)) / k;
          for (let j = 0; j < k; j++) { const px = izq + 1.5 + j * (pw + 3); o.push(rect(px, y0, pw, altoF - c.fhC - 3, PUERTA), manija(j % 2 ? px + 50 : px + pw - 50, y0 + 120, true)); }
        }
        x += w + e;
      });
    }
    const y0 = Math.min(0, d.top || 0);
    const k = Math.max(1, Math.max(A, H - y0) / 650);
    o.push(cota(0, y0, A, y0, `${fmt(A)} mm`, 'arriba', k));
    o.push(cota(A, 0, A, H, `${fmt(H)} mm`, 'derecha', k));
    const padK = pad * k;
    const vb = `${-padK} ${y0 - padK} ${A + 2.4 * padK} ${H - y0 + 1.6 * padK}`;
    return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" font-family="Inter, Noto Sans, Arial, sans-serif">${o.join('')}</svg>`;
  }

  const PALETA = ['#f3d9b1', '#cfe3d4', '#d6dff2', '#f2d4d4', '#e5d9f2', '#f7ecb5', '#d4eef0', '#f0dcc8'];

  // Diagrama de un tablero optimizado
  function tablero(opt, i, nombresIdx) {
    const t = opt.tableros[i];
    const W = opt.W, H = opt.H;
    const o = [rect(0, 0, W, H, '#ffffff', T, 4)];
    t.piezas.forEach((p) => {
      const c = PALETA[p.idx % PALETA.length];
      o.push(rect(p.x, p.y, p.w, p.h, c, T, 2));
      const etiqueta = nombresIdx ? nombresIdx(p.idx) : '';
      const fs = Math.max(40, Math.min(80, Math.min(p.w, p.h) / 3));
      if (p.w > 70 && p.h > 45) {
        o.push(`<text x="${p.x + p.w / 2}" y="${p.y + p.h / 2 + fs / 3}" font-size="${fs}" text-anchor="middle" fill="${T}" font-weight="700">${etiqueta}</text>`);
        if (p.h > 2.6 * fs && p.w > 9 * fs) o.push(`<text x="${p.x + p.w / 2}" y="${p.y + p.h / 2 + fs * 1.4}" font-size="${fs * 0.62}" text-anchor="middle" fill="${T}">${fmt(p.w)} × ${fmt(p.h)}</text>`);
      }
    });
    o.push(`<text x="${W - 10}" y="${H - 14}" font-size="34" text-anchor="end" fill="${GR}">Veta a lo largo</text>`);
    return `<svg viewBox="-10 -10 ${W + 20} ${H + 20}" xmlns="http://www.w3.org/2000/svg" font-family="Inter, Noto Sans, Arial, sans-serif">${o.join('')}</svg>`;
  }

  const api = { frente, tablero };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MelaminaDibujo = api;
})(typeof window !== 'undefined' ? window : globalThis);
