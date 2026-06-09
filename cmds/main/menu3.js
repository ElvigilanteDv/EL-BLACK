import fs from 'fs';
import { join } from 'path';
import { xpRange } from '../../lib/levelling.js';

const meliodasMenu = `
╔══════════════════════════════╗
║  🐉 𝗠𝗘𝗟𝗜𝗢𝗗𝗔𝗦 𝗕𝗢𝗧 - 𝗠𝗗  🐉  ║
║  ⚔️ 𝗗𝗥𝗔𝗚𝗢́𝗡 𝗗𝗘 𝗟𝗔 𝗜𝗥𝗔 ⚔️   ║
╚══════════════════════════════╝

┌─「 🐉 𝗜𝗡𝗙𝗢 𝗗𝗘𝗟 𝗖𝗔𝗣𝗜𝗧𝗔́𝗡 」
│ 👤 *Capitán:* %name
│ %greeting
│
│ 🤖 *Bot:* %botname
│ 🏅 *Rango:* %tipo
│ ⚡ *Nivel:* %level
│ 📅 *Fecha:* %date
│ 🕐 *Hora:* %time
│ ⏱️ *Activo:* %uptime
└──────────────────────────────

╔══════════════════════════════╗
║  ⚔️  𝗖𝗢𝗠𝗔𝗡𝗗𝗢𝗦 𝗗𝗘𝗟 𝗖𝗔𝗣𝗜𝗧𝗔́𝗡  ⚔️  ║
╚══════════════════════════════╝

┌─「 💰 𝗘𝗖𝗢𝗡𝗢𝗠𝗜́𝗔 𝗗𝗘 𝗟𝗜𝗢𝗡𝗘𝗦 」
│ 🍺 %prefixdaily — Recompensa diaria
│ 📅 %prefixweekly — Recompensa semanal
│ 🌙 %prefixmonthly — Recompensa mensual
│ 🔮 %prefixritual — Invocar ritual
│ 🎰 %prefixrt — Ruleta del destino
│ 🗡️ %prefixcrime — Misión de robo
│ 🍺 %prefixslut — Taberna del Jabalí
│ ⚒️ %prefixwork — Trabajar para Liones
│ 🏰 %prefixdungeon — Entrar al calabozo
│ ⛏️ %prefixmine — Minar cristales
│ 🎣 %prefixfish — Pescar en el lago
│ 🗺️ %prefixadventure — Aventura épica
│ 📊 %prefixeinfo — Estado del reino
│ 💎 %prefixbal — Ver monedas
│ 🏆 %prefixbaltop — Ranking del reino
│ 💸 %prefixpay — Transferir monedas
│ 🏦 %prefixdep — Depositar al cofre
│ 🔓 %prefixwithdraw — Retirar del cofre
│ 🛒 %prefixshop — Mercado de Liones
│ 🎒 %prefixinv — Ver inventario
│ ✊ %prefixppt — Piedra papel tijera
│ 🎰 %prefixslot — Tragamonedas mágico
└──────────────────────────────

┌─「 ✨ 𝗚𝗔𝗖𝗛𝗔 𝗗𝗘 𝗣𝗘𝗖𝗔𝗗𝗢𝗥𝗘𝗦 」
│ 🎴 %prefixrw — Invocar Pecador
│ 💖 %prefixc — Reclamar Pecador
└──────────────────────────────

┌─「 📥 𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔𝗦 𝗠𝗔́𝗚𝗜𝗖𝗔𝗦 」
│ 🎵 %prefixplay — Audio YouTube
│ 🎬 %prefixplay2 — Video YouTube
│ 📘 %prefixfb — Video Facebook
│ 🎵 %prefixtiktok — Video TikTok
└──────────────────────────────

┌─「 🔍 𝗕𝗨́𝗦𝗤𝗨𝗘𝗗𝗔 𝗗𝗘𝗟 𝗗𝗥𝗨𝗜𝗗𝗔 」
│ 🎵 %prefixtiktoksearch — Buscar TikTok
│ 📦 %prefixapk — Buscar APK
│ 🎬 %prefixytsearch — Buscar YouTube
└──────────────────────────────

┌─「 🎭 𝗦𝗧𝗜𝗖𝗞𝗘𝗥𝗦 𝗗𝗘𝗟 𝗥𝗘𝗜𝗡𝗢 」
│ 🖼️ %prefixs — Imagen a sticker
└──────────────────────────────

┌─「 📜 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗖𝗜𝗢́𝗡 」
│ 📋 %prefixmenu — Menú principal
│ ⚡ %prefixping — Velocidad del bot
└──────────────────────────────

┌─「 👑 𝗣𝗢𝗗𝗘𝗥𝗘𝗦 𝗗𝗘𝗟 𝗖𝗔𝗣𝗜𝗧𝗔́𝗡 」
│ 🔄 %prefixupdate — Actualizar bot
│ ♻️ %prefixrestart — Reiniciar bot
└──────────────────────────────

╔══════════════════════════════╗
║  🐉 *%channelName*           ║
╚══════════════════════════════╝
❝ No importa cuántas veces
  caiga, siempre me levantaré. ❞
        — *Meliodas*
`;

export default {
  command: ['mmenu', 'meliodas', 'meliodasmenu'],
  category: 'info',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const { level } = global.db.data.users[m.sender] || {};
      const name = m.pushName || 'Capitán';

      const ahora = new Date();
      const horaVenezuela = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Caracas' }));

      const date = horaVenezuela.toLocaleDateString('es', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long'
      });

      const time = horaVenezuela.toLocaleTimeString('es', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      const botId       = client.user.id.split(':')[0] + '@s.whatsapp.net';
      const botSettings = global.db.data.settings[botId] || {};

      const nombreBot = botSettings.namebot || 'MeliodasBot-MD';
      const canalId   = botSettings.id      || global.my.ch;
      const canalName = botSettings.nameid  || '🐉⚔️ MeliodasBot-MD — Dragón de la Ira';

      // 🖼️ Banner de Meliodas
      const imagePath = join(process.cwd(), 'lib', 'meliodas.jpg');
      let bannerFinal = null;
      if (fs.existsSync(imagePath)) {
        bannerFinal = fs.readFileSync(imagePath);
      }

      const isOficialBot = botId === (global.client?.user?.id?.split(':')[0] + '@s.whatsapp.net');
      const tipo = isOficialBot ? '🐉 Dragón de la Ira' : '⚔️ Sub Capitán';

      const uptimeSeconds = global.startTime
        ? (Date.now() - global.startTime) / 1000
        : process.uptime();
      const uptime = clockString(uptimeSeconds * 1000);

      let menu = meliodasMenu
        .replace(/%botname/g,   nombreBot)
        .replace(/%name/g,      name)
        .replace(/%greeting/g,  getMeliodasGreeting(horaVenezuela.getHours()))
        .replace(/%tipo/g,      tipo)
        .replace(/%level/g,     level || 0)
        .replace(/%date/g,      date)
        .replace(/%time/g,      time)
        .replace(/%uptime/g,    uptime)
        .replace(/%prefix/g,    usedPrefix)
        .replace(/%channelName/g, canalName);

      const messageContent = {};

      if (bannerFinal) {
        messageContent.image   = bannerFinal;
        messageContent.caption = menu;
      } else {
        messageContent.text = menu;
      }

      await client.sendMessage(m.chat, messageContent, { quoted: m });

    } catch (e) {
      console.error('Error en menu Meliodas:', e);
      await client.sendMessage(m.chat,
        { text:
          `╔══════════════════════╗\n` +
          `   🐉 *MELIODAS BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `🔴 *Error del Capitán*\n\n` +
          `\`\`\`${e.message}\`\`\`\n\n` +
          `❝ Hasta el Dragón de la\n` +
          `   Ira comete errores. ❞`
        },
        { quoted: m }
      );
    }
  }
};

function clockString(ms) {
  const dias     = Math.floor(ms / 86400000);
  const horas    = Math.floor((ms % 86400000) / 3600000);
  const minutos  = Math.floor((ms % 3600000) / 60000);
  const segundos = Math.floor((ms % 60000) / 1000);

  const partes = [];
  if (dias > 0)  partes.push(`${dias}d`);
  if (horas > 0  || dias > 0)    partes.push(`${horas}h`);
  if (minutos > 0 || horas > 0 || dias > 0) partes.push(`${minutos}m`);
  partes.push(`${segundos}s`);

  return partes.join(' ');
}

function getMeliodasGreeting(hour) {
  const greetings = {
    0:  'una noche en la Taberna Ambulante del Jabalí 🍺🌙',
    1:  'una noche de guardia en el Castillo de Liones 🏰🌑',
    2:  'una noche de poder demoníaco bajo las estrellas 🌌🐉',
    3:  'un amanecer entrenando Full Counter ⚔️🌅',
    4:  'un amanecer meditando con el poder del Dragón 🧘🐉',
    5:  'un entrenamiento secreto con los 7 Pecados 🌄⚔️',
    6:  'una mañana de Revenge Counter en el horizonte ☀️🔥',
    7:  'una mañana sirviendo en la Taberna del Jabalí 🍺🐗',
    8:  'una mañana volando sobre Britannia con Hawk 🌤️🐷',
    9:  'una mañana en el Gran Torneo de Liones 🥋🏆',
    10: 'un día de batalla contra el Clan Demonio ⚔️💥',
    11: 'un día enfrentando a los Diez Mandamientos 👁️🌟',
    12: 'un día soleado junto a Elizabeth en Liones 🌳☀️',
    13: 'una tarde entrenando Assault Mode 🌀🐉',
    14: 'una tarde explorando las ruinas de Camelot 🏰✨',
    15: 'una tarde con los 7 Pecados en misión 🤝⚔️',
    16: 'una tarde desatando el poder demoníaco 💫🔥',
    17: 'un atardecer después de una batalla épica 🌇⚔️',
    18: 'una noche de cerveza en la taberna 🍻🌙',
    19: 'una noche viendo las estrellas con Elizabeth 🌠🐉',
    20: 'una noche de leyendas del Reino de Liones 🪐📜',
    21: 'una noche afilando la espada Lostvayne ⚔️🌱',
    22: 'una noche protegiendo a Elizabeth 🌎🛡️',
    23: 'una noche de vigilia como Capitán 🌃🐉',
  };
  return 'Espero que tengas ' + (greetings[hour] || 'un día digno del Dragón de la Ira 🐉⚔️');
}