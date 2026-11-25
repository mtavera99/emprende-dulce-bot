// Motor de diseño de muebles en melamina: despiece, herrajes, tapacanto y optimización de cortes.
// Lo usan el generador de PDF (scripts/muebles/build.js) y el portal del comprador (src/muebles/portal.js).
// Unidades: milímetros. "largo" es la medida en el sentido de la veta; "ancho", la otra.
(function (root) {
  const CONFIG = {
    e: 15,                 // espesor del tablero de melamina (15 o 18 mm)
    fondo: 3,              // fondo en HDF/MDF de 3 mm, clavado o grapado por detrás
    tablero: { largo: 2440, ancho: 2150 },   // formato Pelíkano 2,15 × 2,44 m (Madecentro); editable
    sierra: 4,             // grueso del corte de la sierra
    refile: 10,            // borde que se recorta a cada lado del tablero
    luz: 3,                // separación entre puertas o frentes, y descuento total al borde
    holguraCorredera: 26,  // total para correderas telescópicas (13 mm por lado)
    retiroEntrepano: 20,   // los entrepaños quedan 20 mm atrás del frente
  };

  const r1 = (v) => Math.round(v * 10) / 10;

  function bisagrasPara(h) { return h <= 900 ? 2 : h <= 1600 ? 3 : h <= 2000 ? 4 : 5; }
  function corredera(p) { return Math.max(250, Math.min(550, Math.floor((p - 40) / 50) * 50)); }

  // ------------------------------------------------------------------ piezas
  function pieza(lista, nombre, cant, largo, ancho, opts = {}) {
    if (cant <= 0) return;
    lista.push({
      nombre, cant, largo: r1(largo), ancho: r1(ancho),
      material: opts.material || 'melamina',
      cantoL: opts.cantoL || 0, cantoA: opts.cantoA || 0,   // número de lados largos / cortos con tapacanto
      grueso: !!opts.grueso,     // tapacanto de 2 mm (puertas y frentes); si no, 0,45 mm
      veta: opts.veta !== false, // si la pieza debe respetar la dirección de la veta
      nota: opts.nota || '',
    });
  }

  function notacion(p) {
    if (p.material !== 'melamina') return '—';
    const s = [];
    if (p.cantoL) s.push(`${p.cantoL}L`);
    if (p.cantoA) s.push(`${p.cantoA}A`);
    return s.length ? s.join(' ') + (p.grueso ? ' (2 mm)' : '') : 'sin canto';
  }

  // ------------------------------------------------------------------ cajón con correderas telescópicas
  function cajon(piezas, herr, c, huecoAncho, frenteAncho, frenteAlto, prof, sufijo = '') {
    const L = corredera(prof);
    const ext = huecoAncho - c.holguraCorredera;
    const hb = Math.max(90, Math.min(frenteAlto - 50, 220));
    pieza(piezas, `Frente visible de cajón${sufijo}`, 1, frenteAncho, frenteAlto, { cantoL: 2, cantoA: 2, grueso: true });
    pieza(piezas, `Lateral de cajón${sufijo}`, 2, L, hb, { cantoL: 1, veta: false });
    pieza(piezas, `Frente y trasera interior de cajón${sufijo}`, 2, ext - 2 * c.e, hb, { cantoL: 1, veta: false });
    pieza(piezas, `Fondo de cajón${sufijo}`, 1, ext, L, { material: 'fondo', veta: false });
    herr.correderas[L] = (herr.correderas[L] || 0) + 1;
    herr.manijas += 1;
    herr.tornillos += 12;
    return { L, ext, hb };
  }

  // ------------------------------------------------------------------ módulo genérico con compartimentos
  // tipos de compartimento: 'abierto' | 'puertas' | 'cajones' | 'colgar' | 'mixto' (cajón arriba + puertas abajo)
  function modulo(spec, cfg = {}) {
    const c = Object.assign({}, CONFIG, cfg);
    const e = c.e;
    const { A, H, P } = spec;
    const zocalo = spec.zocalo || 0;
    const techo = spec.techo !== false;
    const comps = spec.compartimentos || [{ tipo: 'puertas' }];
    const piezas = [];
    const herr = { bisagras: 0, manijas: 0, correderas: {}, soportes: 0, tubos: [], patas: 0, tornillos: 0, colgadores: 0, antivuelco: 0, extra: [] };
    const n = comps.length;
    const Ai = A - 2 * e;
    const w = (Ai - (n - 1) * e) / n;                  // ancho libre de cada compartimento
    const hi = H - zocalo - e - (techo ? e : 0);       // alto libre interior

    pieza(piezas, 'Costado', 2, H, P, { cantoL: 1, nota: 'Canto en el frente' });
    if (techo) pieza(piezas, 'Techo', 1, Ai, P, { cantoL: 1 });
    else pieza(piezas, 'Travesaño superior', 2, Ai, 100, { cantoL: 1, veta: false, nota: 'Uno adelante y uno atrás; sostienen el mesón' });
    pieza(piezas, 'Base (piso)', 1, Ai, P, { cantoL: 1 });
    if (zocalo) pieza(piezas, 'Zócalo frontal', 1, Ai, zocalo, { cantoL: 1, veta: false });
    if (n > 1) pieza(piezas, 'División vertical', n - 1, hi, P - c.fondo, { cantoL: 1 });
    herr.tornillos += 4 * ((techo ? 1 : 2) + 1 + (zocalo ? 1 : 0) + (n - 1));

    // fondo en HDF de 3 mm (lámina de 2,44 × 1,22 m): si es más ancho, se divide y las uniones caen sobre una división o un listón
    const fondoAlto = H - zocalo - 3, fondoAncho = A - 3;
    const corto = Math.min(fondoAlto, fondoAncho), largoF = Math.max(fondoAlto, fondoAncho);
    const kF = corto <= 1200 ? 1 : Math.ceil(fondoAncho / 1200);
    if (kF === 1) pieza(piezas, 'Fondo', 1, largoF, corto, { material: 'fondo', veta: false });
    else pieza(piezas, `Fondo (en ${kF} piezas; las uniones van sobre una división o un listón)`, kF, fondoAlto, fondoAncho / kF, { material: 'fondo', veta: false });

    // límites de cada compartimento para frentes superpuestos (puertas y frentes cubren hasta la mitad de la división)
    const lim = [];
    let x = e;
    for (let i = 0; i < n; i++) {
      const izq = i === 0 ? 0 : x - e / 2;
      const der = i === n - 1 ? A : x + w + e / 2;
      lim.push(der - izq);
      x += w + e;
    }
    const altoFrente = H - zocalo - c.luz;
    const prof = P - c.fondo;

    const dibujo = { A, H, zocalo, techo, e, comps: [] };
    comps.forEach((cp, i) => {
      const span = lim[i];
      const d = { tipo: cp.tipo, w, elementos: [] };
      const entrep = (k, nombre = 'Entrepaño') => {
        pieza(piezas, nombre, k, w - 2, P - c.retiroEntrepano - c.fondo, { cantoL: 1 });
        herr.soportes += 4 * k;
      };
      if (cp.tipo === 'abierto' || cp.tipo === 'puertas') {
        entrep(cp.entrepanos || 0);
        d.entrepanos = cp.entrepanos || 0;
      }
      const auto = (v) => (typeof v === 'number' ? v : (span > 620 ? 2 : 1));
      if (cp.tipo === 'puertas') {
        const k = auto(cp.puertas);
        const pw = (span - c.luz - c.luz * (k - 1)) / k;
        pieza(piezas, 'Puerta', k, altoFrente, pw, { cantoL: 2, cantoA: 2, grueso: true });
        herr.bisagras += k * bisagrasPara(altoFrente);
        herr.manijas += k;
        d.puertas = k;
      }
      if (cp.tipo === 'colgar') {
        pieza(piezas, 'Entrepaño maletero', 1, w - 2, P - c.retiroEntrepano - c.fondo, { cantoL: 1, nota: 'A 400 mm del techo' });
        herr.soportes += 4;
        herr.tubos.push(r1(w - 4));
        d.colgar = true;
        if (cp.puertas) {
          const k = auto(cp.puertas);
          const pw = (span - c.luz - c.luz * (k - 1)) / k;
          pieza(piezas, 'Puerta', k, altoFrente, pw, { cantoL: 2, cantoA: 2, grueso: true });
          herr.bisagras += k * bisagrasPara(altoFrente);
          herr.manijas += k;
          d.puertas = k;
        }
      }
      if (cp.tipo === 'cajones') {
        const k = cp.cajones || 3;
        const alturaZona = cp.altoZona ? cp.altoZona : (H - zocalo);
        const fh = (alturaZona - c.luz * k) / k;
        for (let j = 0; j < k; j++) cajon(piezas, herr, c, w, span - c.luz, fh, prof);
        if (cp.altoZona && cp.entrepanos) entrep(cp.entrepanos);
        if (cp.altoZona) pieza(piezas, 'Entrepaño fijo sobre los cajones', 1, w, P - c.fondo, { cantoL: 1 });
        if (cp.altoZona && cp.puertasArriba) {
          const altoP = H - zocalo - cp.altoZona - c.luz;
          const kk = auto(cp.puertasArriba);
          const pw = (span - c.luz - c.luz * (kk - 1)) / kk;
          pieza(piezas, 'Puerta superior', kk, altoP, pw, { cantoL: 2, cantoA: 2, grueso: true });
          herr.bisagras += kk * bisagrasPara(altoP);
          herr.manijas += kk;
        }
        d.cajones = k; d.fh = fh; d.altoZona = cp.altoZona || 0; d.puertasArriba = cp.puertasArriba ? auto(cp.puertasArriba) : 0; d.entrepanos = cp.entrepanos || 0;
      }
      if (cp.tipo === 'mixto') {
        const fhC = 160;
        cajon(piezas, herr, c, w, span - c.luz, fhC, prof);
        const k = auto(cp.puertas);
        const altoP = altoFrente - fhC - c.luz;
        const pw = (span - c.luz - c.luz * (k - 1)) / k;
        pieza(piezas, 'Puerta', k, altoP, pw, { cantoL: 2, cantoA: 2, grueso: true });
        pieza(piezas, 'Travesaño bajo el cajón', 1, w, 100, { cantoL: 1, veta: false });
        entrep(cp.entrepanos || 0);
        herr.bisagras += k * bisagrasPara(altoP);
        herr.manijas += k;
        d.mixto = true; d.puertas = k; d.fhC = fhC; d.entrepanos = cp.entrepanos || 0;
      }
      dibujo.comps.push(d);
    });
    if (spec.patas) herr.patas = A <= 600 ? 4 : 6;
    if (spec.colgado) herr.colgadores = 2;
    if (H >= 1200) herr.antivuelco = 2;
    return { piezas, herr, dibujo };
  }

  // ------------------------------------------------------------------ escritorio
  function escritorio(spec, cfg = {}) {
    const c = Object.assign({}, CONFIG, cfg);
    const e = c.e;
    const { A, H, P } = spec;
    const piezas = [];
    const herr = { bisagras: 0, manijas: 0, correderas: {}, soportes: 0, tubos: [], patas: 0, tornillos: 0, colgadores: 0, antivuelco: 0, extra: [] };
    pieza(piezas, 'Tapa (superficie de trabajo)', 1, A, P, { cantoL: 2, cantoA: 2, grueso: true });
    pieza(piezas, 'Costado (pata)', 2, H - e, P - 20, { cantoL: 1, cantoA: 1 });
    pieza(piezas, 'Faldón trasero', 1, A - 2 * e, 350, { cantoL: 1, veta: false, nota: 'Da rigidez; va 20 mm adentro del borde trasero' });
    herr.tornillos += 16;
    const dibujo = { A, H, escritorio: true, e };
    if (spec.cajonera) {
      const wc = 400, hc = H - e - 80;
      pieza(piezas, 'Costado de cajonera', 2, hc, P - 60, { cantoL: 1, nota: 'Cajonera bajo la tapa, apoyada en el costado derecho' });
      pieza(piezas, 'Base de cajonera', 1, wc - 2 * e, P - 60, { cantoL: 1 });
      pieza(piezas, 'Fondo de cajonera', 1, hc - 3, wc - 3, { material: 'fondo', veta: false });
      const fh = (hc - 3 * c.luz) / 3;
      for (let j = 0; j < 3; j++) cajon(piezas, herr, c, wc - 2 * e, wc - c.luz, fh, P - 60);
      herr.tornillos += 12;
      dibujo.cajonera = { wc, hc, fh };
    }
    return { piezas, herr, dibujo };
  }

  // ------------------------------------------------------------------ catálogo de planos
  // ------------------------------------------------------------------ utilidades comunes
  const nuevoHerr = () => ({ bisagras: 0, manijas: 0, correderas: {}, soportes: 0, tubos: [], patas: 0, tornillos: 0, colgadores: 0, antivuelco: 0, extra: [] });
  function sumarHerr(a, b, k = 1) {
    for (const key of ['bisagras', 'manijas', 'soportes', 'patas', 'tornillos', 'colgadores', 'antivuelco']) a[key] += (b[key] || 0) * k;
    for (const [L, n] of Object.entries(b.correderas || {})) a.correderas[L] = (a.correderas[L] || 0) + n * k;
    for (let i = 0; i < k; i++) a.tubos.push(...(b.tubos || []));
    for (const [n, cant] of (b.extra || [])) a.extra.push([n, cant * k]);
    return a;
  }
  // Fondo en HDF de 3 mm: si es más ancho que la lámina de 1,22 m, va en varias piezas
  function fondo(piezas, alto, ancho) {
    const corto = Math.min(alto, ancho), largo = Math.max(alto, ancho);
    const k = corto <= 1200 ? 1 : Math.ceil(ancho / 1200);
    if (k === 1) pieza(piezas, 'Fondo', 1, largo, corto, { material: 'fondo', veta: false });
    else pieza(piezas, `Fondo (en ${k} piezas; las uniones van sobre una división o un listón)`, k, alto, ancho / k, { material: 'fondo', veta: false });
  }
  const R = (x, y, w, h, t = 'cuerpo', m = null) => ({ x, y, w, h, t, m });

  // Biblioteca con puertas abajo: cuerpo con entrepaño fijo a 900 mm, puertas abajo y entrepaños arriba
  function bibliotecaPuertas(spec, cfg = {}) {
    const c = Object.assign({}, CONFIG, cfg);
    const e = c.e;
    const { A, H, P } = spec;
    const z = spec.zocalo || 60;
    const res = modulo({ A, H, P, zocalo: z, compartimentos: [{ tipo: 'abierto', entrepanos: 3 }] }, cfg);
    const k = A > 600 ? 2 : 1;
    const altoP = 900 - z - c.luz;
    const pw = (A - c.luz - c.luz * (k - 1)) / k;
    pieza(res.piezas, 'Entrepaño fijo a 900 mm', 1, A - 2 * e, P - c.fondo, { cantoL: 1 });
    pieza(res.piezas, 'Puerta inferior', k, altoP, pw, { cantoL: 2, cantoA: 2, grueso: true });
    res.herr.bisagras += k * bisagrasPara(altoP);
    res.herr.manijas += k;
    res.herr.tornillos += 4;
    res.dibujo.comps[0].bibPuertas = { k, alto: 900 - z };
    return res;
  }

  // ------------------------------------------------------------------ clóset de puertas corredizas
  // Las puertas corren por un riel de doble vía dentro del vano. Divisiones, entrepaños y cajones
  // van 80 mm atrás del frente para que pasen las puertas; los cajones llevan frente interior.
  function corredizo(spec, cfg = {}) {
    const c = Object.assign({}, CONFIG, cfg), e = c.e;
    const { A, H, P } = spec;
    const z = spec.zocalo || 80, k = spec.puertas || 2, RIEL = 80, TRASLAPE = 30, DESC = 40;
    const piezas = [], herr = nuevoHerr();
    const Ai = A - 2 * e, Pint = P - RIEL, hi = H - z - 2 * e;
    const comps = spec.compartimentos, n = comps.length, w = (Ai - (n - 1) * e) / n;
    pieza(piezas, 'Costado', 2, H, P, { cantoL: 1, nota: 'Canto en el frente' });
    pieza(piezas, 'Techo', 1, Ai, P, { cantoL: 1, nota: 'El riel superior se atornilla por debajo, en los primeros 80 mm' });
    pieza(piezas, 'Base (piso)', 1, Ai, P, { cantoL: 1, nota: 'El riel inferior se atornilla encima, en los primeros 80 mm' });
    pieza(piezas, 'Zócalo frontal', 1, Ai, z, { cantoL: 1, veta: false });
    if (n > 1) pieza(piezas, 'División vertical', n - 1, hi, Pint - c.fondo, { cantoL: 1, nota: `Va ${RIEL} mm atrás del frente para que pasen las puertas` });
    herr.tornillos += 4 * (3 + (n - 1));
    fondo(piezas, H - z - 3, A - 3);
    const prof = Pint - c.fondo;
    const rects = [R(0, 0, A, H - z), R(e, H - z, A - 2 * e, z, 'zocalo')];
    comps.forEach((cp) => {
      if (cp.tipo === 'colgar') {
        pieza(piezas, 'Entrepaño maletero', 1, w - 2, prof - c.retiroEntrepano, { cantoL: 1, nota: 'A 400 mm del techo' });
        herr.soportes += 4; herr.tubos.push(r1(w - 4));
      }
      if (cp.tipo === 'abierto') {
        pieza(piezas, 'Entrepaño', cp.entrepanos, w - 2, prof - c.retiroEntrepano, { cantoL: 1 });
        herr.soportes += 4 * cp.entrepanos;
      }
      if (cp.tipo === 'cajones') {
        const kk = cp.cajones || 3, zona = cp.altoZona || 600;
        const fh = (zona - c.luz * (kk + 1)) / kk;
        for (let j = 0; j < kk; j++) cajon(piezas, herr, c, w, w - 4, fh, prof, ' (interior)');
        pieza(piezas, 'Entrepaño fijo sobre los cajones', 1, w, prof, { cantoL: 1 });
        if (cp.entrepanos) { pieza(piezas, 'Entrepaño', cp.entrepanos, w - 2, prof - c.retiroEntrepano, { cantoL: 1 }); herr.soportes += 4 * cp.entrepanos; }
      }
    });
    const altoP = hi - DESC, anchoP = (Ai + (k - 1) * TRASLAPE) / k;
    pieza(piezas, 'Puerta corrediza', k, altoP, anchoP, { cantoL: 2, cantoA: 2, grueso: true, nota: `Para riel de doble vía: alto libre − ${DESC} mm y ${TRASLAPE} mm de traslape entre puertas. Confirma el descuento con el kit que compres` });
    herr.extra.push([`Kit de riel corredizo de doble vía (superior + inferior) de ${Math.round(Ai)} mm`, 1], ['Juego de ruedas y guías por puerta', k], ['Manija embutida para puerta corrediza', k]);
    herr.antivuelco = 2;
    for (let j = 0; j < k; j++) {
      const x = e + j * (anchoP - TRASLAPE);
      rects.push(R(x, e + DESC / 2, anchoP, altoP, j % 2 ? 'frente2' : 'frente', j % 2 ? 'vi' : 'vd'));
    }
    return { piezas, herr, dibujo: { A, H, e, rects }, medidas: { A, H, P } };
  }

  // ------------------------------------------------------------------ escritorio en L
  function escritorioL(spec, cfg = {}) {
    const c = Object.assign({}, CONFIG, cfg), e = c.e;
    const { A, B, H, P } = spec, P2 = spec.P2 || 500;
    const piezas = [], herr = nuevoHerr();
    pieza(piezas, 'Tapa principal', 1, A, P, { cantoL: 2, cantoA: 2, grueso: true });
    pieza(piezas, 'Tapa del ala lateral', 1, B - P, P2, { cantoL: 2, cantoA: 1, grueso: true, nota: 'Se une a la tapa principal por debajo con 2 platinas' });
    pieza(piezas, 'Costado (pata) de la tapa principal', 2, H - e, P - 20, { cantoL: 1, cantoA: 1, nota: 'Uno en el extremo libre y otro en la esquina' });
    pieza(piezas, 'Costado (pata) del ala', 1, H - e, P2 - 20, { cantoL: 1, cantoA: 1 });
    pieza(piezas, 'Faldón trasero', 1, A - 2 * e, 350, { cantoL: 1, veta: false, nota: 'Da rigidez; va 20 mm adentro del borde trasero' });
    pieza(piezas, 'Faldón del ala', 1, B - P - e, 350, { cantoL: 1, veta: false, nota: 'Del costado de la esquina al costado del ala, por el lado del muro' });
    herr.tornillos += 28;
    herr.extra.push(['Platina metálica plana de unión 100 × 30 mm', 2], ['Regatón o nivelador para pata', 6]);
    const rects = [R(0, 0, A, e), R(0, e, e, H - e), R(A - e, e, e, H - e), R(e, e, A - 2 * e, 350, 'oculto')];
    return { piezas, herr, dibujo: { A, H, e, rects }, medidas: { A, H, P: B, etiquetaP: 'largo del ala' } };
  }

  // ------------------------------------------------------------------ escritorio gamer: repisa para monitor + nicho de CPU
  function gamer(spec, cfg = {}) {
    const c = Object.assign({}, CONFIG, cfg), e = c.e;
    const { A, H, P } = spec;
    const r = escritorio({ A, H, P }, cfg);
    const NICHO = 250;
    pieza(r.piezas, 'Repisa elevada para monitor', 1, A - 200, 250, { cantoL: 2, cantoA: 2, grueso: true, nota: 'Atrás, 120 mm sobre la tapa' });
    pieza(r.piezas, 'Soporte de la repisa del monitor', 2, 250, 120 - e, { cantoL: 1, veta: false });
    pieza(r.piezas, 'Costado del nicho de la CPU', 1, H - e, P - 20, { cantoL: 1, cantoA: 1, nota: `A ${NICHO} mm del costado izquierdo` });
    pieza(r.piezas, 'Piso del nicho (100 mm sobre el suelo, para ventilar)', 1, NICHO, P - 20, { cantoL: 1 });
    r.herr.extra = r.herr.extra || [];
    r.herr.extra.push(['Pasacables plástico de 60 mm (se perfora con sierra copa)', 2]);
    r.herr.tornillos += 16;
    const rects = [R(0, 0, A, e), R(0, e, e, H - e), R(A - e, e, e, H - e), R(e, e, A - 2 * e, 350, 'oculto'),
      R(100, -120, A - 200, e), R(110, -120 + e, e, 120 - e), R(A - 110 - e, -120 + e, e, 120 - e),
      R(e + NICHO, e, e, H - e), R(e, H - 100, NICHO, e), R(e, e, NICHO, H - 100 - e, 'hueco')];
    return Object.assign(r, { dibujo: { A, H, e, rects, top: -140 }, medidas: { A, H, P } });
  }

  // ------------------------------------------------------------------ centro de entretenimiento: mueble bajo + 2 torres + repisa puente
  function centroTV(spec, cfg = {}) {
    const c = Object.assign({}, CONFIG, cfg), e = c.e;
    const { A } = spec, Ht = spec.Ht || 1800, Hb = spec.Hb || 500, P = spec.P || 400, Pt = spec.Pt || 300, wt = spec.wt || 400;
    const Ab = A - 2 * wt;
    const bajo = modulo({ A: Ab, H: Hb, P, zocalo: 60, compartimentos: [{ tipo: 'puertas', puertas: 'auto', entrepanos: 0 }, { tipo: 'abierto', entrepanos: 1 }, { tipo: 'puertas', puertas: 'auto', entrepanos: 0 }] }, cfg);
    const torre = modulo({ A: wt, H: Ht, P: Pt, zocalo: 60, compartimentos: [{ tipo: 'abierto', entrepanos: 4 }] }, cfg);
    const piezas = [...bajo.piezas.map((p) => ({ ...p, nombre: `Mueble bajo · ${p.nombre}` })), ...torre.piezas.map((p) => ({ ...p, cant: p.cant * 2, nombre: `Torres (2 iguales) · ${p.nombre}` }))];
    pieza(piezas, 'Repisa puente superior', 1, Ab, Pt, { cantoL: 2, nota: 'Une las dos torres arriba; se atornilla a sus costados interiores' });
    const herr = sumarHerr(sumarHerr(nuevoHerr(), bajo.herr), torre.herr, 2);
    herr.tornillos += 8;
    const rects = [];
    for (const x of [0, A - wt]) {
      rects.push(R(x, 0, wt, Ht - 60), R(x + e, Ht - 60, wt - 2 * e, 60, 'zocalo'), R(x + e, e, wt - 2 * e, Ht - 60 - 2 * e, 'hueco'));
      for (let s = 1; s <= 4; s++) rects.push(R(x + e, e + ((Ht - 60 - 2 * e) * s) / 5, wt - 2 * e, 0, 'linea'));
    }
    rects.push(R(wt, 0, Ab, e));
    const y0 = Ht - Hb, wb = (Ab - 4 * e) / 3;
    rects.push(R(wt, y0, Ab, Hb - 60), R(wt + e, Ht - 60, Ab - 2 * e, 60, 'zocalo'));
    rects.push(R(wt + 1.5, y0 + 1.5, wb + e * 1.5 - 3, Hb - 63, 'frente', 'vd'), R(wt + e * 2 + wb, y0 + e, wb, Hb - 60 - 2 * e, 'hueco'), R(wt + Ab - wb - e * 1.5 + 1.5, y0 + 1.5, wb + e * 1.5 - 3, Hb - 63, 'frente', 'vi'));
    return { piezas, herr, dibujo: { A, H: Ht, e, rects }, medidas: { A, H: Ht, P } };
  }

  // ------------------------------------------------------------------ repisa flotante en caja (se encaja sobre un listón atornillado al muro)
  function repisa(spec, cfg = {}) {
    const c = Object.assign({}, CONFIG, cfg), e = c.e;
    const { A, P } = spec, h = spec.h || 80;
    const piezas = [], herr = nuevoHerr();
    pieza(piezas, 'Tapa superior', 1, A, P, { cantoL: 1, cantoA: 2 });
    pieza(piezas, 'Tapa inferior', 1, A, P, { cantoL: 1, cantoA: 2 });
    pieza(piezas, 'Frente', 1, A, h - 2 * e, { cantoA: 2 });
    pieza(piezas, 'Tapa de los extremos', 2, P - e, h - 2 * e, { veta: false });
    pieza(piezas, 'Listón de pared (se atornilla al muro; la repisa se encaja encima)', 1, A - 2 * e - 4, h - 2 * e - 2, { veta: false });
    herr.tornillos += 16;
    herr.extra.push(['Chazo y tornillo para el listón', Math.max(3, Math.ceil(A / 300))]);
    const rects = [R(0, 0, A, h, 'frente')];
    return { piezas, herr, dibujo: { A, H: h, e, rects }, medidas: { A, H: h, P } };
  }

  // ------------------------------------------------------------------ cama con cabecero (estructura tipo cajón, base en tablero)
  function cama(spec, cfg = {}) {
    const c = Object.assign({}, CONFIG, cfg), e = c.e;
    const L = spec.colchonL, W = spec.colchonA, hb = spec.hb || 300, hc = spec.hc || 1000;
    const Li = L + 20, Wi = W + 20, A = Wi + 2 * e, Lout = Li + 2 * e;
    const piezas = [], herr = nuevoHerr();
    const ap = hb - 40 - e;
    pieza(piezas, 'Lateral (larguero)', 2, Li, hb, { cantoL: 2 });
    pieza(piezas, 'Frente del pie de cama', 1, A, hb, { cantoL: 2, cantoA: 2 });
    pieza(piezas, 'Travesaño de la cabecera', 1, A, hb, { cantoL: 1 });
    pieza(piezas, 'Listón de apoyo de la base', 2, Li, 60, { veta: false, nota: `Por dentro de cada lateral, con su borde de arriba a ${ap} mm del piso` });
    pieza(piezas, 'Viga central (apoya en el piso)', 1, Li, ap, { veta: false, nota: 'En el centro y a lo largo; sostiene la base' });
    const kb = Math.ceil(Li / 800), lb = (Li - (kb - 1) * 20) / kb;
    pieza(piezas, `Base (tendido) en ${kb} piezas`, kb, Wi, lb, { veta: false, nota: 'Deja 20 mm entre piezas para que el colchón respire' });
    pieza(piezas, 'Cabecero', 1, A, hc, { cantoL: 2, cantoA: 2, grueso: true, nota: 'Se atornilla por detrás al travesaño de la cabecera' });
    pieza(piezas, 'Refuerzo del cabecero', 2, hc - 50, 100, { veta: false, nota: 'Por detrás, en vertical, cerca de cada extremo' });
    herr.tornillos += 60;
    herr.extra.push(['Escuadra metálica de 3" (esquinas, viga y cabecero)', 10], ['Fieltro o regatón para la base', 6]);
    const rects = [R(0, 0, A, hc), R(e, hc - hb - 160, Wi, 200, 'oculto'), R(0, hc - hb, A, hb, 'frente')];
    if (spec.baranda) {
      pieza(piezas, 'Baranda de seguridad', 1, 900, 350, { cantoL: 2, cantoA: 2, grueso: true, nota: 'Por dentro del lateral libre, con 100 mm de traslape; deja el resto abierto para subir' });
      herr.extra.push(['Platina en L de 3" para la baranda', 2]);
    }
    return { piezas, herr, dibujo: { A, H: hc, e, rects }, medidas: { A, H: hc, P: Lout } };
  }

  // ------------------------------------------------------------------ tocador con cajones y panel para espejo
  function tocador(spec, cfg = {}) {
    const c = Object.assign({}, CONFIG, cfg), e = c.e;
    const { A, H, P } = spec;
    const piezas = [], herr = nuevoHerr();
    const n = A > 900 ? 2 : 1, zona = 150, hueco = (A - 2 * e - (n - 1) * e) / n;
    pieza(piezas, 'Tapa', 1, A, P, { cantoL: 2, cantoA: 2, grueso: true });
    pieza(piezas, 'Costado (pata)', 2, H - e, P - 20, { cantoL: 1, cantoA: 1 });
    pieza(piezas, 'Faldón trasero', 1, A - 2 * e, zona, { cantoL: 1, veta: false });
    pieza(piezas, 'Piso del cajonero', 1, A - 2 * e, P - 40, { cantoL: 1, nota: `A ${zona} mm bajo la tapa` });
    if (n > 1) pieza(piezas, 'División del cajonero', n - 1, zona, P - 40, { cantoL: 1 });
    for (let i = 0; i < n; i++) cajon(piezas, herr, c, hueco, hueco - 4, zona - 6, P - 40, ' (interior)');
    pieza(piezas, 'Panel para el espejo', 1, A - 200, 700, { cantoL: 2, cantoA: 2, grueso: true, nota: 'Se atornilla al muro 50 mm sobre la tapa; el espejo se pega con silicona neutra' });
    herr.tornillos += 20;
    herr.extra.push([`Espejo de 4 mm de ${A - 240} × 660 mm (se pide en una vidriería)`, 1], ['Chazo y tornillo para el panel del espejo', 4]);
    const top = -750;
    const rects = [R(100, top, A - 200, 700, 'espejo'), R(0, 0, A, e), R(0, e, e, H - e), R(A - e, e, e, H - e)];
    for (let i = 0; i < n; i++) rects.push(R(e + i * (hueco + e) + 2, e + 3, hueco - 4, zona - 6, 'frente', 'h'));
    return { piezas, herr, dibujo: { A, H, e, rects, top: top - 20 }, medidas: { A, H, P } };
  }

  // ------------------------------------------------------------------ organizador de cubos
  function cubos(spec, cfg = {}) {
    const c = Object.assign({}, CONFIG, cfg), e = c.e;
    const { filas, cols } = spec, cu = spec.cubo || 330, P = spec.P || 330;
    const A = cols * cu + (cols + 1) * e, H = filas * cu + (filas + 1) * e;
    const piezas = [], herr = nuevoHerr();
    pieza(piezas, 'Costado', 2, H, P, { cantoL: 1 });
    pieza(piezas, 'Techo y base', 2, A - 2 * e, P, { cantoL: 1 });
    if (cols > 1) pieza(piezas, 'División vertical', cols - 1, H - 2 * e, P - c.fondo, { cantoL: 1 });
    if (filas > 1) pieza(piezas, 'Entrepaño fijo (entre divisiones)', (filas - 1) * cols, cu, P - c.fondo, { cantoL: 1, nota: 'Fijo con tornillo o tarugo: le da rigidez al mueble' });
    fondo(piezas, H - 3, A - 3);
    herr.tornillos += 8 + 4 * (cols - 1) + 4 * (filas - 1) * cols;
    if (H >= 1000) herr.antivuelco = 2;
    const rects = [R(0, 0, A, H)];
    for (let i = 0; i < filas; i++) for (let j = 0; j < cols; j++) rects.push(R(e + j * (cu + e), e + i * (cu + e), cu, cu, 'hueco'));
    return { piezas, herr, dibujo: { A, H, e, rects }, medidas: { A, H, P } };
  }

  // ------------------------------------------------------------------ baúl juguetero con tapa
  function baul(spec, cfg = {}) {
    const c = Object.assign({}, CONFIG, cfg), e = c.e;
    const { A, H, P } = spec;
    const piezas = [], herr = nuevoHerr();
    pieza(piezas, 'Frente y trasera', 2, A, H - e, { cantoL: 1, cantoA: 2 });
    pieza(piezas, 'Lateral', 2, P - 2 * e, H - e, { cantoL: 1 });
    pieza(piezas, 'Base', 1, A - 2 * e, P - 2 * e, { nota: 'Va 20 mm arriba del piso, entre las 4 piezas' });
    pieza(piezas, 'Tapa', 1, A, P, { cantoL: 2, cantoA: 2, grueso: true });
    herr.tornillos += 24; herr.manijas += 2;
    herr.extra.push([`Bisagra de piano (continua) de ${A - 40} mm`, 1], ['Soporte de tapa con freno para baúl (evita que la tapa caiga)', 2], ['Rodachina de 40 mm (opcional)', 4]);
    const rects = [R(0, 0, A, e, 'frente'), R(0, e, A, H - e), R(e, 60, A - 2 * e, 0, 'linea')];
    return { piezas, herr, dibujo: { A, H, e, rects }, medidas: { A, H, P } };
  }

  // ------------------------------------------------------------------ mesa abatible de pared
  function mesaAbatible(spec, cfg = {}) {
    const c = Object.assign({}, CONFIG, cfg), e = c.e;
    const { A, P } = spec;
    const piezas = [], herr = nuevoHerr();
    pieza(piezas, 'Listón de pared', 1, A, 100, { cantoL: 1, cantoA: 2, nota: 'Se atornilla al muro con chazos; su borde de arriba a 735 mm del piso' });
    pieza(piezas, 'Tapa abatible', 1, A, P, { cantoL: 2, cantoA: 2, grueso: true });
    pieza(piezas, 'Refuerzo bajo la tapa', 2, P - 60, 80, { veta: false, nota: 'Atornillado bajo la tapa; ahí se fijan las escuadras plegables' });
    herr.tornillos += 16;
    herr.extra.push([`Bisagra de piano de ${A - 40} mm`, 1], [`Par de escuadras plegables con seguro para tapa de ${P} mm`, 1], ['Chazo y tornillo de 3/8" para el listón', Math.max(3, Math.ceil(A / 300))]);
    const rects = [R(0, 0, A, e, 'frente'), R(0, e, A, 100), R(60, 100 + e, 20, 250, 'linea'), R(A - 80, 100 + e, 20, 250, 'linea')];
    return { piezas, herr, dibujo: { A, H: 750, e, rects, soloAlto: 750 }, medidas: { A, H: 750, P } };
  }

  // ------------------------------------------------------------------ catálogo de planos (5 categorías)
  const B = (A, extra) => Object.assign({ A, H: 720, P: 560, techo: false, patas: true }, extra);
  const RH = 'Usa melamina RH (resistente a la humedad) y sella con silicona los cantos cercanos al agua.';
  const clo = (A, c, H) => ({ cod: `CLO-${A}-${H}`, nombre: `Clóset de ${c.length} cuerpos con puertas abatibles`, spec: { A, H, P: 550, zocalo: 80, compartimentos: c } });
  const familias = [
    { id: '01', nombre: 'Cocinas integrales, alacenas y baño', corto: 'Cocina y baño', items: [
      ...[300, 350, 400, 450, 500].map((A) => ({ cod: `COC-B1P-${A}`, nombre: 'Módulo bajo de cocina de 1 puerta', spec: B(A, { compartimentos: [{ tipo: 'puertas', puertas: 1, entrepanos: 1 }] }) })),
      ...[600, 700, 800, 900, 1000].map((A) => ({ cod: `COC-B2P-${A}`, nombre: 'Módulo bajo de cocina de 2 puertas', spec: B(A, { compartimentos: [{ tipo: 'puertas', puertas: 2, entrepanos: 1 }] }) })),
      ...[800, 900, 1000, 1200].map((A) => ({ cod: `COC-LAV-${A}`, nombre: 'Módulo bajo de lavaplatos', spec: B(A, { compartimentos: [{ tipo: 'puertas', puertas: 2, entrepanos: 0 }] }), nota: 'Perfora el fondo y la base para la tubería antes de instalar. ' + RH })),
      ...[400, 450, 500, 600, 800].map((A) => ({ cod: `COC-B3C-${A}`, nombre: 'Módulo bajo de cocina de 3 cajones', spec: B(A, { compartimentos: [{ tipo: 'cajones', cajones: 3 }] }) })),
      ...[400, 500, 600, 800, 900].map((A) => ({ cod: `COC-BCP-${A}`, nombre: 'Módulo bajo de cocina con cajón y puertas', spec: B(A, { compartimentos: [{ tipo: 'mixto', puertas: A > 500 ? 2 : 1, entrepanos: 1 }] }) })),
      ...[300, 350, 400, 450, 500].map((A) => ({ cod: `COC-A1P-${A}`, nombre: 'Alacena (módulo aéreo) de 1 puerta', spec: { A, H: 700, P: 330, colgado: true, compartimentos: [{ tipo: 'puertas', puertas: 1, entrepanos: 1 }] } })),
      ...[600, 700, 800, 900, 1000].map((A) => ({ cod: `COC-A2P-${A}`, nombre: 'Alacena (módulo aéreo) de 2 puertas', spec: { A, H: 700, P: 330, colgado: true, compartimentos: [{ tipo: 'puertas', puertas: 2, entrepanos: 1 }] } })),
      ...[600, 800].map((A) => ({ cod: `COC-AAB-${A}`, nombre: 'Alacena abierta (repisa de cocina)', spec: { A, H: 700, P: 330, colgado: true, compartimentos: [{ tipo: 'abierto', entrepanos: 2 }] } })),
      ...[450, 600].map((A) => ({ cod: `COC-TOR-${A}`, nombre: 'Torre despensa de piso a techo', spec: { A, H: 2100, P: 560, zocalo: 80, compartimentos: [{ tipo: 'puertas', puertas: A > 500 ? 2 : 1, entrepanos: 5 }] } })),
      ...[600, 800].map((A) => ({ cod: `BAN-LAV-${A}`, nombre: 'Mueble de lavamanos colgado (baño)', spec: { A, H: 500, P: 450, colgado: true, compartimentos: [{ tipo: 'puertas', puertas: A > 600 ? 2 : 1, entrepanos: 0 }] }, nota: RH + ' Se cuelga al muro.' })),
      ...[600, 800].map((A) => ({ cod: `BAN-LPI-${A}`, nombre: 'Mueble de lavamanos de piso (baño)', spec: { A, H: 800, P: 450, zocalo: 60, compartimentos: [{ tipo: 'puertas', puertas: A > 600 ? 2 : 1, entrepanos: 0 }] }, nota: RH })),
      ...[500, 600].map((A) => ({ cod: `BAN-BOT-${A}`, nombre: 'Botiquín aéreo de baño', spec: { A, H: 600, P: 150, colgado: true, compartimentos: [{ tipo: 'puertas', puertas: A > 500 ? 2 : 1, entrepanos: 2 }] }, nota: RH })),
    ] },
    { id: '02', nombre: 'Clósets, armarios, vestidores y zapateras', corto: 'Clósets y zapateras', items: [
      ...[2000, 2200].flatMap((H) => [
        clo(1000, [{ tipo: 'colgar', puertas: 'auto' }, { tipo: 'puertas', puertas: 'auto', entrepanos: 4 }], H),
        clo(1200, [{ tipo: 'colgar', puertas: 'auto' }, { tipo: 'puertas', puertas: 'auto', entrepanos: 4 }], H),
        clo(1400, [{ tipo: 'colgar', puertas: 'auto' }, { tipo: 'cajones', cajones: 3, altoZona: 800, entrepanos: 2, puertasArriba: 'auto' }], H),
        clo(1600, [{ tipo: 'colgar', puertas: 'auto' }, { tipo: 'cajones', cajones: 3, altoZona: 800, entrepanos: 2, puertasArriba: 'auto' }], H),
        clo(1800, [{ tipo: 'colgar', puertas: 'auto' }, { tipo: 'cajones', cajones: 3, altoZona: 800, entrepanos: 2, puertasArriba: 'auto' }, { tipo: 'colgar', puertas: 'auto' }], H),
        clo(2000, [{ tipo: 'colgar', puertas: 'auto' }, { tipo: 'puertas', puertas: 'auto', entrepanos: 4 }, { tipo: 'cajones', cajones: 3, altoZona: 800, entrepanos: 2, puertasArriba: 'auto' }], H),
        clo(2400, [{ tipo: 'colgar', puertas: 'auto' }, { tipo: 'puertas', puertas: 'auto', entrepanos: 4 }, { tipo: 'cajones', cajones: 3, altoZona: 800, entrepanos: 2, puertasArriba: 'auto' }, { tipo: 'colgar', puertas: 'auto' }], H),
      ]),
      ...[[1200, 2, [{ tipo: 'colgar' }, { tipo: 'abierto', entrepanos: 5 }]],
        [1500, 2, [{ tipo: 'colgar' }, { tipo: 'cajones', cajones: 3, altoZona: 600, entrepanos: 3 }]],
        [1800, 2, [{ tipo: 'colgar' }, { tipo: 'cajones', cajones: 3, altoZona: 600, entrepanos: 3 }, { tipo: 'colgar' }]],
        [2400, 3, [{ tipo: 'colgar' }, { tipo: 'abierto', entrepanos: 5 }, { tipo: 'cajones', cajones: 3, altoZona: 600, entrepanos: 3 }, { tipo: 'colgar' }]]]
        .map(([A, k, comps]) => ({ cod: `CLO-COR-${A}`, nombre: `Clóset de ${k} puertas corredizas`, tipo: 'corredizo', spec: { A, H: 2200, P: 600, zocalo: 80, puertas: k, compartimentos: comps } })),
      ...[1200, 1800, 2400].map((A) => ({ cod: `CLO-ABI-${A}`, nombre: 'Vestier abierto (sin puertas)', spec: { A, H: 2200, P: 550, zocalo: 80, compartimentos: A === 1200 ? [{ tipo: 'colgar' }, { tipo: 'abierto', entrepanos: 5 }] : A === 1800 ? [{ tipo: 'colgar' }, { tipo: 'abierto', entrepanos: 5 }, { tipo: 'colgar' }] : [{ tipo: 'colgar' }, { tipo: 'abierto', entrepanos: 5 }, { tipo: 'cajones', cajones: 3, altoZona: 800, entrepanos: 3 }, { tipo: 'colgar' }] } })),
      ...[600, 800, 1000].map((A) => ({ cod: `ZAP-PUE-${A}`, nombre: 'Zapatero con puertas', spec: { A, H: 1000, P: 350, zocalo: 60, compartimentos: [{ tipo: 'puertas', puertas: A > 600 ? 2 : 1, entrepanos: 3 }] } })),
      ...[800, 1000, 1200].map((A) => ({ cod: `ZAP-BAN-${A}`, nombre: 'Banca zapatera de entrada', spec: { A, H: 450, P: 350, zocalo: 0, compartimentos: Array.from({ length: A > 1000 ? 3 : 2 }, () => ({ tipo: 'abierto', entrepanos: 1 })) } })),
    ] },
    { id: '03', nombre: 'Escritorios, oficina y centros de entretenimiento', corto: 'Escritorios y TV', items: [
      ...[900, 1000, 1200, 1400].map((A) => ({ cod: `ESC-BAS-${A}`, nombre: 'Escritorio básico', tipo: 'escritorio', spec: { A, H: 750, P: 600 } })),
      ...[1200, 1400, 1600].map((A) => ({ cod: `ESC-CAJ-${A}`, nombre: 'Escritorio con cajonera de 3 cajones', tipo: 'escritorio', spec: { A, H: 750, P: 600, cajonera: true } })),
      ...[[1400, 1200], [1600, 1400], [1800, 1600]].map(([A, Bl]) => ({ cod: `ESC-L-${A}`, nombre: `Escritorio en L (ala de ${Bl} mm)`, tipo: 'escritorioL', spec: { A, B: Bl, H: 750, P: 600 } })),
      ...[1200, 1400, 1600].map((A) => ({ cod: `ESC-GAM-${A}`, nombre: 'Escritorio gamer con repisa para monitor y nicho de CPU', tipo: 'gamer', spec: { A, H: 750, P: 650 } })),
      ...[450, 500].map((A) => ({ cod: `OFI-ARC-${A}`, nombre: 'Archivador de oficina de 2 cajones', spec: { A, H: 720, P: 600, zocalo: 60, compartimentos: [{ tipo: 'cajones', cajones: 2 }] }, nota: 'Para carpetas colgantes, agrega barras laterales o un marco metálico dentro del cajón (no incluidos).' })),
      ...[600, 800, 1000].map((A) => ({ cod: `OFI-BIB-${A}`, nombre: 'Biblioteca abierta', spec: { A, H: 1800, P: 300, zocalo: 60, compartimentos: [{ tipo: 'abierto', entrepanos: 4 }] } })),
      ...[800, 1000].map((A) => ({ cod: `OFI-BIP-${A}`, nombre: 'Biblioteca con puertas abajo', tipo: 'bibliotecaPuertas', spec: { A, H: 2000, P: 350, zocalo: 60 } })),
      ...[1200, 1400, 1600, 1800, 2000].map((A) => ({ cod: `TV-PIS-${A}`, nombre: 'Mueble de TV de piso (puertas + nicho)', spec: { A, H: 500, P: 400, zocalo: 60, compartimentos: [{ tipo: 'puertas', puertas: 'auto', entrepanos: 0 }, { tipo: 'abierto', entrepanos: 1 }, { tipo: 'puertas', puertas: 'auto', entrepanos: 0 }] } })),
      ...[1200, 1500, 1800].map((A) => ({ cod: `TV-FLO-${A}`, nombre: 'Mueble de TV flotante (cajones + nicho)', spec: { A, H: 350, P: 350, colgado: true, compartimentos: [{ tipo: 'cajones', cajones: 1 }, { tipo: 'abierto', entrepanos: 0 }, { tipo: 'cajones', cajones: 1 }] }, nota: 'Se cuelga con 3 escuadras o un riel francés atornillado al muro con chazos de 3/8".' })),
      ...[2000, 2400, 2800].map((A) => ({ cod: `TV-CEN-${A}`, nombre: 'Centro de entretenimiento (mueble bajo + 2 torres + repisa)', tipo: 'centroTV', spec: { A } })),
      ...[600, 800, 1000, 1200].map((A) => ({ cod: `REP-FLO-${A}`, nombre: 'Repisa flotante (listón oculto)', tipo: 'repisa', spec: { A, P: 250, h: 80 }, nota: 'Para carga liviana: libros y decoración. En drywall, atornilla el listón a los parales.' })),
    ] },
    { id: '04', nombre: 'Dormitorio: camas, cómodas, mesas de noche y tocadores', corto: 'Dormitorio', items: [
      ...[[1000, 'sencilla'], [1200, 'semidoble'], [1400, 'doble'], [1600, 'queen'], [2000, 'king']].map(([W, t]) => ({ cod: `CAM-${t.toUpperCase()}`, nombre: `Cama ${t} con cabecero (colchón de ${W / 10} × ${t === 'king' ? 200 : 190} cm)`, tipo: 'cama', e: 18, spec: { colchonA: W, colchonL: t === 'king' ? 2000 : 1900 }, nota: 'Estructura en melamina de 18 mm. Mide tu colchón antes de pedir el corte: el plano deja 10 mm de holgura por lado.' })),
      ...[400, 450, 500].map((A) => ({ cod: `DOR-MN1-${A}`, nombre: 'Mesa de noche de 2 cajones', spec: { A, H: 520, P: 400, zocalo: 60, compartimentos: [{ tipo: 'cajones', cajones: 2 }] } })),
      ...[400, 450, 500].map((A) => ({ cod: `DOR-MN2-${A}`, nombre: 'Mesa de noche de 1 puerta y entrepaño', spec: { A, H: 520, P: 400, zocalo: 60, compartimentos: [{ tipo: 'puertas', puertas: 1, entrepanos: 1 }] } })),
      ...[600, 800, 1000].map((A) => ({ cod: `DOR-CO4-${A}`, nombre: 'Cómoda de 4 cajones', spec: { A, H: 900, P: 450, zocalo: 60, compartimentos: [{ tipo: 'cajones', cajones: 4 }] } })),
      { cod: 'DOR-CO6-1200', nombre: 'Cómoda de 6 cajones (2 columnas)', spec: { A: 1200, H: 900, P: 450, zocalo: 60, compartimentos: [{ tipo: 'cajones', cajones: 3 }, { tipo: 'cajones', cajones: 3 }] } },
      ...[800, 1000, 1200].map((A) => ({ cod: `DOR-TOC-${A}`, nombre: 'Tocador con cajones y panel para espejo', tipo: 'tocador', spec: { A, H: 760, P: 420 } })),
    ] },
    { id: '05', nombre: 'Infantiles, ahorradores de espacio y organizadores', corto: 'Infantil y organizadores', items: [
      ...[[2, 2], [2, 3], [3, 3], [2, 4], [4, 4]].map(([f, k]) => ({ cod: `ORG-CUB-${f}X${k}`, nombre: `Organizador de cubos ${f} × ${k}`, tipo: 'cubos', spec: { filas: f, cols: k } })),
      ...[800, 1000].map((A) => ({ cod: `INF-BAU-${A}`, nombre: 'Baúl juguetero con tapa', tipo: 'baul', spec: { A, H: 450, P: 450 }, nota: 'Usa soportes de tapa con freno para que la tapa no caiga sobre los dedos. Haz 2 perforaciones de 25 mm en la trasera para ventilación.' })),
      ...[800, 1000].map((A) => ({ cod: `INF-ESC-${A}`, nombre: 'Escritorio infantil', tipo: 'escritorio', spec: { A, H: 580, P: 500 }, nota: 'Altura de 58 cm para niños de 6 a 10 años aproximadamente; usa una silla acorde.' })),
      ...[[900, 'INF-CAM-90'], [1000, 'INF-CAM-100']].map(([W, cod]) => ({ cod, nombre: `Cama infantil con baranda (colchón de ${W / 10} × 190 cm)`, tipo: 'cama', e: 18, spec: { colchonA: W, colchonL: 1900, hb: 300, hc: 800, baranda: true }, nota: 'Estructura en melamina de 18 mm. Instala la cama contra el muro y la baranda del lado libre.' })),
      ...[800, 1000, 1200].map((A) => ({ cod: `AHO-MAB-${A}`, nombre: 'Mesa abatible de pared', tipo: 'mesaAbatible', spec: { A, P: 600 }, nota: 'Solo en muro de ladrillo o concreto; en drywall, ancla el listón a los parales.' })),
      { cod: 'AHO-LAV-800', nombre: 'Organizador de lavandería (escobas + entrepaños)', spec: { A: 800, H: 1800, P: 400, zocalo: 60, compartimentos: [{ tipo: 'puertas', puertas: 1, entrepanos: 0 }, { tipo: 'puertas', puertas: 1, entrepanos: 4 }] } },
    ] },
  ];

  const CONSTRUCTORES = { escritorio, bibliotecaPuertas, corredizo, escritorioL, gamer, centroTV, repisa, cama, tocador, cubos, baul, mesaAbatible };

  // cfg: { e } espesor y { tablero } formato. Cada plano puede fijar su espesor (camas en 18 mm).
  function construir(item, cfg = {}) {
    const conf = Object.assign({}, cfg, item.e && !cfg.forzarE ? { e: item.e } : {});
    const f = CONSTRUCTORES[item.tipo] || modulo;
    const r = f(item.spec, conf);
    r.piezas = consolidar(r.piezas);
    r.e = conf.e || CONFIG.e;
    r.medidas = r.medidas || { A: item.spec.A, H: item.spec.H, P: item.spec.P };
    r.herr.extra = r.herr.extra || [];
    return Object.assign(r, resumen(r, conf));
  }

  // Une las piezas iguales (mismo nombre, medidas, material y cantos) en una sola fila
  function consolidar(lista) {
    const out = [];
    for (const p of lista) {
      const k = out.find((q) => q.nombre === p.nombre && q.largo === p.largo && q.ancho === p.ancho && q.material === p.material && q.cantoL === p.cantoL && q.cantoA === p.cantoA && q.grueso === p.grueso);
      if (k) k.cant += p.cant; else out.push(Object.assign({}, p));
    }
    return out;
  }

  // ------------------------------------------------------------------ paso a paso de armado (según las piezas del plano)
  function pasos(item, r) {
    const tiene = (re) => r.piezas.some((p) => re.test(p.nombre));
    const out = ['Marca cada pieza con su número del despiece (con lápiz, por la cara que no se ve) y revisa las cantidades antes de empezar.'];
    const t = item.tipo;
    if (t === 'cama') {
      out.push('Atornilla los listones de apoyo por dentro de cada lateral, a la altura indicada en el despiece.',
        'Une los laterales con el frente del pie y el travesaño de la cabecera con escuadras metálicas; verifica la escuadra midiendo las dos diagonales.',
        'Coloca la viga central en el piso, a lo largo y en el centro, y fíjala a los travesaños con escuadras.',
        'Apoya las piezas de la base sobre los listones y la viga, dejando 20 mm entre ellas, y atorníllalas.',
        'Atornilla el cabecero por detrás al travesaño de la cabecera y refuérzalo con los 2 refuerzos verticales.');
      if (item.spec.baranda) out.push('Atornilla la baranda por dentro del lateral libre con las platinas en L, con 100 mm de traslape.');
      out.push('Pon los fieltros bajo la estructura y prueba el colchón: debe entrar sin forzar.');
      return out;
    }
    if (t === 'repisa') {
      return out.concat(['Arma la caja: tapa inferior, frente y tapas de los extremos atornilladas a la tapa superior (deja la parte de atrás abierta).',
        'Atornilla el listón al muro con chazos, nivelado, a la altura que quieras.',
        'Encaja la caja sobre el listón y fíjala con 2 o 3 tornillos desde arriba hacia el listón.']);
    }
    if (t === 'mesaAbatible') {
      return out.concat(['Atornilla el listón de pared nivelado, con su borde de arriba a 735 mm del piso, con chazos de 3/8".',
        'Atornilla los 2 refuerzos bajo la tapa, cerca de los extremos.',
        'Une la tapa al listón con la bisagra de piano, por el borde de arriba.',
        'Monta las escuadras plegables entre el muro (bajo el listón) y los refuerzos; prueba que traben con el seguro antes de apoyar peso.']);
    }
    if (t === 'baul') {
      return out.concat(['Arma la caja: frente y trasera atornillados a los laterales; verifica la escuadra.',
        'Atornilla la base por dentro, 20 mm arriba del piso. Si usas rodachinas, atorníllalas debajo.',
        'Perfora 2 agujeros de ventilación de 25 mm en la trasera.',
        'Instala la tapa con la bisagra de piano y luego los 2 soportes de tapa con freno; prueba que la tapa quede quieta abierta.']);
    }
    if (/^escritorio|gamer|tocador/.test(t || '')) {
      out.push('Atornilla el faldón entre los dos costados (patas), 20 mm adentro del borde trasero; verifica la escuadra.');
      if (t === 'escritorioL') out.push('Coloca el costado del ala y su faldón; apoya las dos tapas boca abajo, únelas con las 2 platinas y atorníllalas a la estructura desde abajo.');
      else out.push('Apoya la tapa boca abajo sobre una manta, pon la estructura encima y atorníllala desde adentro con tornillos de 4 × 30 mm (que no atraviesen la tapa).');
      if (t === 'gamer') out.push('Atornilla el costado y el piso del nicho de la CPU; arma la repisa del monitor con sus 2 soportes y fíjala atrás.', 'Perfora los pasacables con sierra copa de 60 mm donde vayan los cables.');
      if (t === 'tocador') out.push('Atornilla el piso del cajonero (y la división) bajo la tapa; monta las correderas y los cajones.', 'Atornilla el panel del espejo al muro, 50 mm sobre la tapa, y pega el espejo con silicona neutra.');
    } else {
      out.push('Arma el cuerpo: atornilla base, techo (o travesaños) y zócalo entre los dos costados. Verifica la escuadra midiendo las dos diagonales: deben dar lo mismo.');
      if (tiene(/División|Entrepaño fijo \(entre/)) out.push('Coloca las divisiones y los entrepaños fijos a la medida del plano y atorníllalos.');
      out.push('Con el cuerpo boca abajo y en escuadra, clava o grapa el fondo de HDF cada 10 cm: es lo que mantiene el mueble cuadrado.');
      if (tiene(/^Entrepaño$|Entrepaño maletero|Torres .*Entrepaño/)) out.push('Perfora los huecos de los pines de 5 mm y coloca los entrepaños.');
      if (r.herr.tubos.length) out.push('Instala el tubo colgador 60 mm bajo el entrepaño maletero.');
      if (tiene(/cajón/i)) out.push('Arma cada cajón (laterales, frente y trasera interior, fondo), monta las correderas a la misma altura en el cuerpo y en la caja, y al final atornilla el frente visible desde adentro.');
      if (tiene(/^Puerta( superior| inferior)?$|· Puerta/)) out.push('Atornilla las bisagras en las cazoletas, cuelga las puertas y regúlalas hasta que las luces queden parejas.');
      if (tiene(/Puerta corrediza/)) out.push('Atornilla el riel superior bajo el techo y el inferior sobre la base, en los primeros 80 mm; monta las ruedas en las puertas, cuélgalas y regula la altura hasta que corran parejas.');
      if (item.spec.colgado) out.push('Cuélgalo en un listón nivelado o con colgadores de alacena y chazos acordes al muro.');
      if (r.herr.antivuelco) out.push('Ancla el mueble al muro con las escuadras antivuelco: un mueble alto sin anclar se puede volcar.');
    }
    out.push('Pon las manijas con una plantilla de cartón para que queden a la misma altura, y limpia el polvo de la melamina con un trapo húmedo.');
    return out.filter((x, i, a) => a.indexOf(x) === i);
  }

  // ------------------------------------------------------------------ resumen de materiales
  function resumen(r, cfg = {}) {
    const c = Object.assign({}, CONFIG, cfg);
    let m2mel = 0, m2fon = 0, cantoFino = 0, cantoGrueso = 0, cortes = 0;
    for (const p of r.piezas) {
      const area = (p.largo * p.ancho * p.cant) / 1e6;
      if (p.material === 'melamina') m2mel += area; else m2fon += area;
      const m = ((p.cantoL * p.largo + p.cantoA * p.ancho) * p.cant) / 1000;
      if (p.grueso) cantoGrueso += m; else cantoFino += m;
      cortes += p.cant;
    }
    r.herr.perimetroFondo = r.piezas.filter((p) => p.material !== 'melamina').reduce((n, p) => n + 2 * (p.largo + p.ancho) * p.cant, 0);
    const opt = optimizar(r.piezas.filter((p) => p.material === 'melamina'), c);
    const optF = optimizar(r.piezas.filter((p) => p.material !== 'melamina'), Object.assign({}, c, { tablero: { largo: 2440, ancho: 1220 } }), false);
    return {
      m2mel: r1(m2mel * 100) / 100, m2fon: r1(m2fon * 100) / 100,
      cantoFino: Math.ceil(cantoFino * 1.1 * 10) / 10, cantoGrueso: Math.ceil(cantoGrueso * 1.1 * 10) / 10,
      cortes, tableros: opt.tableros.length, aprovechamiento: opt.aprovechamiento, optimizacion: opt,
      fondos: optF.tableros.length,
    };
  }

  // ------------------------------------------------------------------ optimizador de cortes (guillotina por franjas y columnas)
  // Las piezas con veta van con su "largo" paralelo al largo del tablero; las demás pueden girarse.
  function optimizar(piezas, c, respetarVeta = true) {
    const W = c.tablero.largo - 2 * c.refile;   // eje x: largo del tablero (sentido de la veta)
    const Hh = c.tablero.ancho - 2 * c.refile;
    const s = c.sierra;
    const items = [];
    piezas.forEach((p, idx) => {
      for (let i = 0; i < p.cant; i++) items.push({ idx, nombre: p.nombre, l: p.largo, a: p.ancho, veta: respetarVeta && p.veta });
    });
    // orientación: x = largo (veta). Sin veta, se elige la orientación con menor alto de franja.
    items.forEach((it) => {
      it.w = it.l; it.h = it.a;
      if (!it.veta) { if (it.h > it.w && it.h <= W) { it.w = it.a; it.h = it.l; } }
      if (it.w > W && it.h <= W && !it.veta) { const t = it.w; it.w = it.h; it.h = t; }
      it.cabe = it.w <= W && it.h <= Hh;
    });
    const noCaben = items.filter((it) => !it.cabe);
    const ordenes = [
      (a, b) => b.h - a.h || b.w - a.w,
      (a, b) => b.w * b.h - a.w * a.h,
      (a, b) => b.w - a.w || b.h - a.h,
      (a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h),
    ];
    let mejor = null;
    for (const orden of ordenes) for (const fn of [empacar, guillotina]) {
      const res = fn(items.filter((it) => it.cabe).slice().sort(orden), W, Hh, s);
      if (!mejor || res.tableros.length < mejor.tableros.length || (res.tableros.length === mejor.tableros.length && res.ultimo > mejor.ultimo)) mejor = res;
    }
    const tableros = mejor.tableros;
    const lista = items.filter((it) => it.cabe);
    const areaT = W * Hh * Math.max(1, tableros.length);
    const areaP = lista.reduce((n, it) => n + it.w * it.h, 0);
    return { tableros, W, H: Hh, aprovechamiento: tableros.length ? Math.round((areaP / areaT) * 1000) / 10 : 0, noCaben };
  }

  // Guillotina con rectángulos libres (Best Area Fit, corte por el eje más corto). Cada corte atraviesa el retal completo.
  function guillotina(lista, W, Hh, s) {
    const tableros = [];
    for (const it of lista) {
      let mejor = null;
      const opciones = it.veta ? [[it.w, it.h]] : [[it.w, it.h], [it.h, it.w]];
      tableros.forEach((t, ti) => t.libres.forEach((f, fi) => opciones.forEach(([w, h]) => {
        if (w <= f.w && h <= f.h) {
          const sobra = f.w * f.h - w * h;
          if (!mejor || sobra < mejor.sobra) mejor = { ti, fi, w, h, sobra };
        }
      })));
      if (!mejor) {
        const t = { libres: [{ x: 0, y: 0, w: W, h: Hh }], piezas: [] };
        tableros.push(t);
        const [w, h] = opciones.find(([w, h]) => w <= W && h <= Hh) || opciones[0];
        mejor = { ti: tableros.length - 1, fi: 0, w, h };
      }
      const t = tableros[mejor.ti];
      const f = t.libres.splice(mejor.fi, 1)[0];
      t.piezas.push({ x: f.x, y: f.y, w: mejor.w, h: mejor.h, nombre: it.nombre, idx: it.idx });
      const dw = f.w - mejor.w - s, dh = f.h - mejor.h - s;
      // corta a lo largo del eje que deja el retal más grande y aprovechable
      if (dw * f.h >= dh * f.w) {
        if (dw > 0) t.libres.push({ x: f.x + mejor.w + s, y: f.y, w: dw, h: f.h });
        if (dh > 0) t.libres.push({ x: f.x, y: f.y + mejor.h + s, w: mejor.w, h: dh });
      } else {
        if (dh > 0) t.libres.push({ x: f.x, y: f.y + mejor.h + s, w: f.w, h: dh });
        if (dw > 0) t.libres.push({ x: f.x + mejor.w + s, y: f.y, w: dw, h: mejor.h });
      }
    }
    const ultimo = tableros.length ? 1 - tableros[tableros.length - 1].piezas.reduce((n, p) => n + p.w * p.h, 0) / (W * Hh) : 0;
    return { tableros, ultimo };
  }

  function empacar(lista, W, Hh, s) {
    const tableros = [];
    const nuevoTablero = () => { const t = { franjas: [], usado: 0, piezas: [] }; tableros.push(t); return t; };
    for (const it of lista) {
      let ok = false;
      for (const t of tableros) {
        for (const f of t.franjas) {
          // apilar en una columna existente de la franja
          for (const col of f.cols) {
            if (it.w <= col.w && col.usadoH + s + it.h <= f.h) {
              t.piezas.push({ x: col.x, y: f.y + col.usadoH + s, w: it.w, h: it.h, nombre: it.nombre, idx: it.idx });
              col.usadoH += s + it.h; ok = true; break;
            }
          }
          if (ok) break;
          // nueva columna en la franja
          if (it.h <= f.h && f.usadoW + (f.cols.length ? s : 0) + it.w <= W) {
            const x = f.usadoW + (f.cols.length ? s : 0);
            f.cols.push({ x, w: it.w, usadoH: it.h });
            f.usadoW = x + it.w;
            t.piezas.push({ x, y: f.y, w: it.w, h: it.h, nombre: it.nombre, idx: it.idx });
            ok = true; break;
          }
        }
        if (ok) break;
        // nueva franja en el tablero
        const y = t.usado + (t.franjas.length ? s : 0);
        if (y + it.h <= Hh) {
          t.franjas.push({ y, h: it.h, usadoW: it.w, cols: [{ x: 0, w: it.w, usadoH: it.h }] });
          t.usado = y + it.h;
          t.piezas.push({ x: 0, y, w: it.w, h: it.h, nombre: it.nombre, idx: it.idx });
          ok = true; break;
        }
      }
      if (!ok) {
        const t = nuevoTablero();
        t.franjas.push({ y: 0, h: it.h, usadoW: it.w, cols: [{ x: 0, w: it.w, usadoH: it.h }] });
        t.usado = it.h;
        t.piezas.push({ x: 0, y: 0, w: it.w, h: it.h, nombre: it.nombre, idx: it.idx });
      }
    }
    // «ultimo»: espacio libre del último tablero (más libre = mejor, sobra un retal más grande)
    const ultimo = tableros.length ? 1 - tableros[tableros.length - 1].piezas.reduce((n, p) => n + p.w * p.h, 0) / (W * Hh) : 0;
    return { tableros, ultimo };
  }

  function herrajesLista(h) {
    const out = [];
    if (h.bisagras) out.push(['Bisagra de cazoleta 35 mm (superpuesta, con cierre)', h.bisagras]);
    Object.entries(h.correderas).forEach(([L, n]) => out.push([`Par de correderas telescópicas de ${L} mm`, n]));
    if (h.manijas) out.push(['Manija o tirador', h.manijas]);
    if (h.soportes) out.push(['Soporte (pin) para entrepaño', h.soportes]);
    const tubos = {};
    h.tubos.forEach((t) => { const k = Math.round(t); tubos[k] = (tubos[k] || 0) + 1; });
    Object.entries(tubos).forEach(([t, n]) => out.push([`Tubo colgador ovalado de ${t} mm + 2 soportes`, n]));
    if (h.patas) out.push(['Pata niveladora plástica de 10 cm', h.patas]);
    if (h.colgadores) out.push(['Colgador de alacena (o riel francés)', h.colgadores]);
    if (h.antivuelco) out.push(['Escuadra antivuelco al muro + chazo', h.antivuelco]);
    const extra = {};
    (h.extra || []).forEach(([n, c]) => { extra[n] = (extra[n] || 0) + c; });
    Object.entries(extra).forEach(([n, c]) => out.push([n, c]));
    out.push(['Tornillo para aglomerado 4 × 40 mm (aprox.)', Math.ceil(h.tornillos / 10) * 10]);
    if (h.perimetroFondo) out.push(['Puntilla o grapa para fondo (aprox.)', Math.max(20, Math.ceil(h.perimetroFondo / 100 / 10) * 10)]);
    return out;
  }

  function catalogo() { return familias; }
  function buscar(cod) { for (const f of familias) { const it = f.items.find((i) => i.cod === cod); if (it) return { item: it, fam: f }; } return null; }
  // Diseño base de un plano: el mismo mueble en otra medida o tamaño cuenta como el mismo diseño
  function diseno(it) {
    return it.nombre.replace(/ \(.*\)$/, '').replace(/ (sencilla|semidoble|doble|queen|king)\b/, '').replace(/ \d+ × \d+$/, '').trim();
  }
  function disenos() { return [...new Set(familias.flatMap((f) => f.items.map(diseno)))]; }
  function contar() { return familias.reduce((n, f) => n + f.items.length, 0); }

  const api = { CONFIG, modulo, escritorio, construir, optimizar, resumen, notacion, herrajesLista, catalogo, contar, buscar, disenos, diseno, pasos, corredera, bisagrasPara, CONSTRUCTORES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Melamina = api;
})(typeof window !== 'undefined' ? window : globalThis);
