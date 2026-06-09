import fs from 'fs';

// ╔══════════════════════════════════════╗
// ║     ⚔️  NANATSUBOT-MD CONFIG  ⚔️     ║
// ║      🔱 LOS 7 PECADOS CAPITALES 🔱   ║
// ╚══════════════════════════════════════╝

// 👑 PROPIETARIOS DEL REINO
global.owner = [
    '51910227479', // 🐉 Pecado Principal
    ''             // 🌀 Co-Owner
]

global.botNumber = ''

// ⚙️ CONFIGURACIÓN BASE
global.sessionName = 'Sessions/NanatsuBot'
global.version     = '⚔️ 1.0 — NanatsuBot-MD 🔱'
global.dev         = '⚡ Powered by NanatsuBot-MD — Los 7 Pecados'
global.wm          = 'NanatsuBot-MD ⚔️'

// 🔗 ENLACES DEL REINO
global.links = {
    api:     'NanatsuBot API ⚔️',
    channel: 'https://whatsapp.com/channel/0029VbCv5KCAe5Vpc1nH6u1Y',
    github:  'https://github.com/dvwilker',
    gmail:   'developer.wilker.ofc@gmail.com'
}

// 📢 CANAL OFICIAL
global.my = {
    ch:   '0029VbCv5KCAe5Vpc1nH6u1Y@newsletter',
    name: '⚔️✦ AmiIkarGit — NanatsuBot-MD ✦🔱',
}

// ⚠️ MENSAJES DEL SISTEMA
global.mess = {
    owner:    '👑 Solo los *Pecados Capitales* pueden ejecutar este poder.',
    socket:   '⚔️ Este comando solo puede ser ejecutado por un *Socket NanatsuBot*.',
    admin:    '🛡️ Este comando es exclusivo de los *Caballeros Sagrados* (Admins).',
    botAdmin: '🔱 El bot debe ser *Caballero Sagrado* para ejecutar este comando.',
    group:    '🏰 Este comando solo puede usarse dentro de un *Reino* (grupo).',
    private:  '🗡️ Este comando solo puede usarse en *mensajes privados*.',
    wait:     '⏳ *Invocando el poder del Pecado...* Por favor espera.',
    error:    '💀 Algo salió mal en el reino. Inténtalo de nuevo.',
    cooldown: '⚠️ Poder en recarga. Espera antes de usarlo de nuevo.',
}

// 🌐 APIs DEL REINO DE BRITANNIA
global.APIs = {
    adonix:    { url: 'https://api-adonix.ultraplus.click', key: 'Danielrxz' },
    vreden:    { url: 'https://api.vreden.web.id',          key: null },
    nekolabs:  { url: 'https://api.nekolabs.web.id',        key: null },
    siputzx:   { url: 'https://api.siputzx.my.id',          key: null },
    delirius:  { url: 'https://api.delirius.store',          key: null },
    ootaizumi: { url: 'https://api.ootaizumi.web.id',        key: null },
    stellar:   { url: 'https://api.stellarwa.xyz',           key: global.wm },
    apifaa:    { url: 'https://api-faa.my.id',               key: null },
    xyro:      { url: 'https://api.xyro.site',               key: null },
    yupra:     { url: 'https://api.yupra.my.id',             key: null },
}