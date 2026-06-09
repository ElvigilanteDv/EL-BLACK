import fs from 'fs';
import { join } from 'path';
import { xpRange } from '../../lib/levelling.js';

const defaultMenu = `
╔══════════════════════════════╗
║  ⚔️  𝗡𝗔𝗡𝗔𝗧𝗦𝗨 𝗕𝗢𝗧 - 𝗠𝗗  ⚔️  ║
║   🔱 𝗟𝗢𝗦 𝟳 𝗣𝗘𝗖𝗔𝗗𝗢𝗦 🔱    ║
╚══════════════════════════════╝

┌─「 🐉 𝗜𝗡𝗙𝗢 𝗗𝗘𝗟 𝗣𝗘𝗖𝗔𝗗𝗢𝗥 」
│ 👤 *Pecador:* %name
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
║  🗡️  𝗖𝗢𝗠𝗔𝗡𝗗𝗢𝗦 𝗗𝗘𝗟 𝗥𝗘𝗜𝗡𝗢  🗡️  ║
╚══════════════════════════════╝

┌─「 ✨ 𝗚𝗔𝗖𝗛𝗔 𝗗𝗘 𝗣𝗘𝗖𝗔𝗗𝗢𝗥𝗘𝗦 」
│ 🎴 %prefixrw — Invocar Pecador
│ 💖 %prefixc — Reclamar Pecador
└──────────────────────────────

┌─「 🫧 GRUPOS 」
│ 🎴 %prefixkick — expulsar a un integrante 
│ 💖 %prefixctag — menciona a todos del grupo
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
│ 🐍 %prefixdianamenu — menú de Diana 
│ 👑 %prefixmeliodasmenu — Menu del Capitan
│ 🎯 %prefixcode — Aste subbot por code
│ ⏳ %prefixqr — Aste subbot por QR
└──────────────────────────────

┌─「 👑 𝗣𝗢𝗗𝗘𝗥𝗘𝗦 𝗗𝗘𝗟 𝗖𝗥𝗘𝗔𝗗𝗢𝗥 」
│ 🔄 %prefixupdate — Actualizar bot
│ ♻️ %prefixrestart — Reiniciar bot
└──────────────────────────────

╔══════════════════════════════╗
║  🔱 *AmilcarGit*           ║
╚══════════════════════════════╝
❝ El poder verdadero nace
  del corazón, no del miedo. ❞
         — *Meliodas*
`;

export default {
  command: ['menu', 'help', 'menú', 'ayuda', 'comandos', 'nanatsu'],
  category: 'info',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const { exp, limit, level } = global.db.data.users[m.sender] || {};
      const { min, xp, max } = xpRange(level || 0, global.multiplier || 1);
      const name = m.pushName || 'Pecador';

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

      const botId = client.user.id.split(':')[0] + '@s.whatsapp.net';
      const botSettings = global.db.data.settings[botId] || {};

 const nombreBot = botSettings.namebot || 'NanatsuBot-MD';
      const canalId = botSettings.id || '120363404707199986@newsletter';
      const canalName = botSettings.nameid || '⚔️ NanatsuBot-MD — Los 7 Pecados';

      // Imagen del banner
      const imagePath = join(process.cwd(), 'lib', 'nanatsu.jpg');
      let bannerFinal = null;
      if (fs.existsSync(imagePath)) {
        bannerFinal = fs.readFileSync(imagePath);
      }

      const isOficialBot = botId === (global.client?.user?.id?.split(':')[0] + '@s.whatsapp.net');
      const tipo = isOficialBot ? '⚔️ Pecado Capital' : '🔱 Caballero Sagrado';

      const uptimeSeconds = global.startTime
        ? (Date.now() - global.startTime) / 1000
        : process.uptime();
      const uptime = clockString(uptimeSeconds * 1000);

      let menu = defaultMenu
        .replace(/%botname/g, nombreBot)
        .replace(/%name/g, name)
        .replace(/%greeting/g, getNanatsuGreeting(horaVenezuela.getHours()))
        .replace(/%tipo/g, tipo)
        .replace(/%level/g, level || 0)
        .replace(/%date/g, date)
        .replace(/%time/g, time)
        .replace(/%uptime/g, uptime)
        .replace(/%prefix/g, usedPrefix)
        .replace(/%channelName/g, canalName);

      const messageContent = {};

      if (bannerFinal) {
        messageContent.image = bannerFinal;
        messageContent.caption = menu;
      } else {
        messageContent.text = menu;
      }

      await client.sendMessage(m.chat, messageContent, { quoted: m });

    } catch (e) {
      console.error('Error en menu NanatsuBot:', e);
      await client.sendMessage(m.chat,
        { text: `⚔️ *NanatsuBot-MD*\n\n🔴 *Error del Reino*\n\`\`\`${e.message}\`\`\`\n\n❝ Hasta los Pecados cometen errores. ❞` },
        { quoted: m }
      );
    }
  }
};

function clockString(ms) {
  const dias = Math.floor(ms / 86400000);
  const horas = Math.floor((ms % 86400000) / 3600000);
  const minutos = Math.floor((ms % 3600000) / 60000);
  const segundos = Math.floor((ms % 60000) / 1000);

  const partes = [];
  if (dias > 0) partes.push(`${dias}d`);
  if (horas > 0 || dias > 0) partes.push(`${horas}h`);
  if (minutos > 0 || horas > 0 || dias > 0) partes.push(`${minutos}m`);
  partes.push(`${segundos}s`);

  return partes.join(' ');
}

function getNanatsuGreeting(hour) {
  const greetings = {
    0:  'una noche misteriosa en el Bosque Sagrado 🌙🌲',
    1:  'una noche oscura en el Castillo de Liones 🏰🌑',
    2:  'una noche de poder bajo las estrellas del reino 🌌⚔️',
    3:  'un amanecer en las tierras de Britannia 🌅🗺️',
    4:  'un amanecer meditando con el poder del Pecado 🧘⚔️',
    5:  'un entrenamiento secreto con los 7 Pecados 🌄🔱',
    6:  'una mañana de Full Counter en el horizonte ☀️🛡️',
    7:  'una mañana en la Taberna Ambulante del Jabalí 🍺🐗',
    8:  'una mañana volando sobre Britannia 🌤️🦅',
    9:  'una mañana en el Gran Torneo de Liones 🥋🏆',
    10: 'un día de batalla contra el Clan Demonio ⚔️💥',
    11: 'un día en el Torneo de los Diez Mandamientos 👁️🌟',
    12: 'un día soleado en el Bosque de las Hadas 🌳☀️',
    13: 'una tarde entrenando el poder del Pecado 🌀💪',
    14: 'una tarde explorando las ruinas de Camelot 🏰✨',
    15: 'una tarde forjando alianzas en el reino 🤝🌸',
    16: 'una tarde de transformaciones y poder 💫🔱',
    17: 'un atardecer después de la Gran Batalla 🌇⚔️',
    18: 'una noche de recuperación en la taberna 🍻🌙',
    19: 'una noche viendo las estrellas de Britannia 🌠🐉',
    20: 'una noche de leyendas del Reino de Liones 🪐📜',
    21: 'una noche preparando el próximo combate ⚔️🌱',
    22: 'una noche protegiendo el reino de Britannia 🌎🛡️',
    23: 'una noche de guardia junto a los 7 Pecados 🌃⚔️',
  };
  return 'Espero que tengas ' + (greetings[hour] || 'un día digno de un Pecado Capital ⚔️🔱');
}