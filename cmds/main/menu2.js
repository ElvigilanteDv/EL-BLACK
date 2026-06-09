import fs from 'fs';
import { join } from 'path';
import { xpRange } from '../../lib/levelling.js';

const dianaMenu = `
╔══════════════════════════════╗
║  🐍 𝗗𝗜𝗔𝗡𝗔 𝗕𝗢𝗧 - 𝗠𝗗  🐍  ║
║  💜 𝗦𝗘𝗥𝗣𝗜𝗘𝗡𝗧𝗘 𝗗𝗘 𝗟𝗔 𝗘𝗡𝗩𝗜𝗗𝗜𝗔 💜  ║
╚══════════════════════════════╝

┌─「 💜 𝗜𝗡𝗙𝗢 𝗗𝗘𝗟 𝗚𝗨𝗘𝗥𝗥𝗘𝗥𝗢 」
│ 👤 *Guerrero:* %name
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
║  🗡️  𝗖𝗢𝗠𝗔𝗡𝗗𝗢𝗦 𝗗𝗘𝗟 𝗚𝗜𝗚𝗔𝗡𝗧𝗘  🗡️  ║
╚══════════════════════════════╝

┌─「 💰 𝗘𝗖𝗢𝗡𝗢𝗠𝗜́𝗔 𝗗𝗘𝗟 𝗖𝗟𝗔𝗡 𝗚𝗜𝗚𝗔𝗡𝗧𝗘 」
│ 🍀 %prefixdaily — Recompensa diaria
│ 📅 %prefixweekly — Recompensa semanal
│ 🌙 %prefixmonthly — Recompensa mensual
│ 🔮 %prefixritual — Invocar ritual
│ 🎰 %prefixrt — Ruleta del destino
│ 🗡️ %prefixcrime — Misión de combate
│ 💃 %prefixslut — Taberna del reino
│ ⚒️ %prefixwork — Trabajar para Diana
│ 🏔️ %prefixdungeon — Explorar cavernas
│ ⛏️ %prefixmine — Minar cristales
│ 🎣 %prefixfish — Pescar en el río
│ 🗺️ %prefixadventure — Aventura épica
│ 📊 %prefixeinfo — Estado del clan
│ 💎 %prefixbal — Ver monedas
│ 🏆 %prefixbaltop — Ranking del clan
│ 💸 %prefixpay — Transferir monedas
│ 🏦 %prefixdep — Depositar al cofre
│ 🔓 %prefixwithdraw — Retirar del cofre
│ 🛒 %prefixshop — Mercado gigante
│ 🎒 %prefixinv — Ver inventario
│ ✊ %prefixppt — Piedra papel tijera
│ 🎰 %prefixslot — Tragamonedas mágico
└──────────────────────────────

╔══════════════════════════════╗
║  🐍 *amilkarGit*           ║
╚══════════════════════════════╝
❝ El tamaño no define
  la fuerza del corazón. ❞
        — *Diana*
`;

export default {
  command: ['dianamenu'],
  category: 'info',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const { level } = global.db.data.users[m.sender] || {};
      const name = m.pushName || 'Guerrero';

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

      const nombreBot   = botSettings.namebot || 'DianaBot-MD';
      const canalId     = botSettings.id   || global.my.ch;
      const canalName   = botSettings.nameid || '🐍💜 DianaBot-MD — Serpiente de la Envidia';

      // 🖼️ Banner de Diana
      const imagePath = join(process.cwd(), 'lib', 'diana.jpg');
      let bannerFinal = null;
      if (fs.existsSync(imagePath)) {
        bannerFinal = fs.readFileSync(imagePath);
      }

      const isOficialBot = botId === (global.client?.user?.id?.split(':')[0] + '@s.whatsapp.net');
      const tipo = isOficialBot ? '🐍 Diana Principal' : '💜 Sub Diana';

      const uptimeSeconds = global.startTime
        ? (Date.now() - global.startTime) / 1000
        : process.uptime();
      const uptime = clockString(uptimeSeconds * 1000);

      let menu = dianaMenu
        .replace(/%botname/g, nombreBot)
        .replace(/%name/g, name)
        .replace(/%greeting/g, getDianaGreeting(horaVenezuela.getHours()))
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
      console.error('Error en menu Diana:', e);
      await client.sendMessage(m.chat,
        { text:
          `╔══════════════════════╗\n` +
          `   🐍 *DIANA BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `🔴 *Error del reino*\n\n` +
          `\`\`\`${e.message}\`\`\`\n\n` +
          `❝ Hasta Diana comete errores. ❞`
        },
        { quoted: m }
      );
    }
  }
};

function clockString(ms) {
  const dias    = Math.floor(ms / 86400000);
  const horas   = Math.floor((ms % 86400000) / 3600000);
  const minutos = Math.floor((ms % 3600000) / 60000);
  const segundos = Math.floor((ms % 60000) / 1000);

  const partes = [];
  if (dias > 0) partes.push(`${dias}d`);
  if (horas > 0 || dias > 0) partes.push(`${horas}h`);
  if (minutos > 0 || horas > 0 || dias > 0) partes.push(`${minutos}m`);
  partes.push(`${segundos}s`);

  return partes.join(' ');
}

function getDianaGreeting(hour) {
  const greetings = {
    0:  'una noche tranquila en las tierras gigantes 🌙💜',
    1:  'una noche de guardia en el Clan Gigante 🌑🐍',
    2:  'una noche de poder bajo las estrellas 🌌💜',
    3:  'un amanecer en las montañas de los gigantes 🌅🏔️',
    4:  'un amanecer entrenando con Chastiefol 🌄🌿',
    5:  'un entrenamiento secreto con King 💚🌸',
    6:  'una mañana de Gideon golpeando el horizonte ☀️🔨',
    7:  'una mañana en el campamento del Clan Gigante 🏕️🐍',
    8:  'una mañana explorando Britannia 🌤️🗺️',
    9:  'una mañana en el Gran Torneo de Liones 🥋🏆',
    10: 'un día de batalla contra el Clan Demonio ⚔️💥',
    11: 'un día protegiendo a sus compañeros Pecados 🛡️🌟',
    12: 'un día soleado en las praderas de Britannia 🌳☀️',
    13: 'una tarde entrenando su fuerza gigante 💪🐍',
    14: 'una tarde explorando nuevas tierras 🏔️✨',
    15: 'una tarde junto a King en el bosque 💚🌸',
    16: 'una tarde de transformaciones gigantes 💜🌀',
    17: 'un atardecer después de una gran batalla 🌇⚔️',
    18: 'una noche de descanso en la taberna 🍺🌙',
    19: 'una noche viendo las estrellas con King 🌠💜',
    20: 'una noche de leyendas del Clan Gigante 🪐📖',
    21: 'una noche preparando Gideon para mañana 🔨🌱',
    22: 'una noche protegiendo las tierras gigantes 🌎🛡️',
    23: 'una noche de guardia junto a los Pecados 🌃💜',
  };
  return 'Espero que tengas ' + (greetings[hour] || 'un día digno de una Gigante ⚔️🐍');
}