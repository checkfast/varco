/* =====================================================================
   VARCO · CONFIGURAZIONE FRONTEND — modifica SOLO questa sezione
   (usata da index.html, dashboard.html, checkin.html, invito.html)
   ===================================================================== */
window.VARCO = {
  API_URL: 'https://script.google.com/macros/s/AKfycbxsMvG3pYUepSPpsr9HJj3CunLuDNKsOfissK3e57-okNYxZNk41lbUV0AECixP_3Iqyg/exec',
  BRAND: 'Varco',
  PAYOFF: 'Accrediti digitali per eventi',
  PAYPAL_CLIENT_ID: '',        // ← Client ID PayPal LIVE. Vuoto = solo bonifico
  CURRENCY: 'EUR',
  VAT: 22,

  // Prezzi IVA esclusa. Tienili allineati con PLANS in Code.gs (il server comanda sui prezzi reali)
  PLANS: [
    { id: 'START', name: 'Start', price: 89, note: 'una tantum', for: 'Il singolo evento', guests: 250, emails: 500,
      limits: ['1 evento', 'Fino a 250 ospiti', '3 dispositivi in contemporanea', 'Attivo 60 giorni', 'Max 500 email'],
      features: ['Lista digitale + QR univoco per ospite', 'Import da Excel/CSV', 'Campi personalizzati (intolleranze, tavolo, note…)', 'Badge e inviti PDF stampabili', 'Inviti email personalizzati e link WhatsApp', 'Logo e colori del tuo evento', 'Più ingressi con postazioni nominate', 'Ospiti aggiunti al volo dall\'app', 'Report live + export Excel', 'Email con la scritta “Varco by With You Agency”'] },
    { id: 'PRO', name: 'Pro', price: 249, note: 'una tantum', for: 'Eventi aziendali, congressi, wedding', highlight: true, guests: 1000, emails: 2000,
      limits: ['1 evento', 'Fino a 1.000 ospiti', '5 dispositivi in contemporanea', 'Attivo 75 giorni', 'Max 2.000 email'],
      features: ['Tutto di Start', 'Email agli ospiti senza la scritta “Varco by With You Agency”'] },
    { id: 'BUSINESS', name: 'Business', price: 790, note: 'una tantum', for: 'Grandi eventi e agenzie che rivendono', guests: 2500, emails: 5000,
      limits: ['1 evento', 'Fino a 2.500 ospiti', 'Fino a 10 dispositivi', 'Attivo 90 giorni', 'Max 5.000 email'],
      features: ['Tutto di Pro', 'White label totale: nessun riferimento a Varco su email, app e pass', 'Più eventi? Chiedi un preventivo Enterprise'] }
  ],

  // Extra acquistabili con il pacchetto (prezzi IVA esclusa). Tienili allineati con ADDONS in Code.gs
  ADDONS: [
    { id: 'E250', label: 'Aggiungi 250 email', emails: 250, price: 49 },
    { id: 'E500', label: 'Aggiungi 500 email', emails: 500, price: 79 },
    { id: 'E1000', label: 'Aggiungi 1000 email', emails: 1000, price: 149 }
  ],

  // Quarto pacchetto: servizio gestito, solo su preventivo
  ENTERPRISE: {
    name: 'Enterprise',
    for: 'Grandi eventi, congressi, fiere, tour',
    text: 'Pensiamo a tutto noi: tu ci mandi la lista, noi ci occupiamo dell\'accredito dall\'inizio alla fine.',
    features: ['Configurazione completa dell\'evento e importazione della lista', 'Inviti personalizzati e gestione delle risposte', 'Email illimitate e white label totale', 'Hostess e staff di accredito in loco', 'Dispositivi, lettori QR e stampa badge sul posto', 'Assistenza dedicata e report finale'],
    email: 'info@withyouagency.it'
  },

  COMPANY: {
    name: 'WITH YOU SRL',
    address: 'Via Privata del Gonfalone, 3 - 20123 Milano (MI)',
    vat: 'IT10940150963',
    cf: '10940150963',
    rea: 'MI-2568062',
    capital: '€ 10.000,00 i.v.',
    pec: 'withyousrl@pec.it',
    sdi: 'KRRH6B9'
  },
  CONTACTS: {
    email: 'info@withyouagency.it',
    phone: '+39 02 5656 8571',
    whatsapp: '390000000000',    // ← numero WhatsApp: solo cifre, con prefisso 39
    hours: 'Lun–Ven 9:00–19:00'
  },
  LEGAL: { privacy: 'privacy.html', terms: 'termini.html', cookie: 'cookie.html', rules: 'regolamento.html' }  // link alle pagine legali
};

/* ---------------- motore comune (non modificare) ---------------- */
(function () {
  const C = window.VARCO;
  window.api = async function (action, data) {
    if (!C.API_URL) throw new Error('Configura API_URL in config.js');
    let res;
    try {
      res = await fetch(C.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({ action: action }, data || {}))
      });
    } catch (e) { const x = new Error('Connessione assente'); x.net = true; throw x; }
    let j;
    try { j = await res.json(); } catch (e) { throw new Error('Risposta del server non valida'); }
    if (!j.ok) throw new Error(j.error || 'Errore');
    return j.data;
  };
  window.vurl = function (page) {
    return location.href.split(/[?#]/)[0].replace(/[^/]*$/, '') + page;
  };
  window.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  const GG = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
  const MM = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  window.fmtData = function (s) {
    const m = String(s || '').match(/(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
    if (!m) return s || '';
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return GG[d.getDay()] + ' ' + (+m[3]) + ' ' + MM[+m[2] - 1] + ' ' + m[1] + (m[4] ? ' · ore ' + m[4] + ':' + m[5] : '');
  };
  window.fmtOra = function (iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  };
  window.euro = function (n) {
    return '€ ' + Number(n).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
})();
