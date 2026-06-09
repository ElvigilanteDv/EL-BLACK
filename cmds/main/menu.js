import fs from 'fs';
import { join } from 'path';
import { xpRange } from '../../lib/levelling.js';

const defaultMenu = `
◤━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◥
│  🐉 𝙶𝙾𝚃𝙴𝙽𝙺𝚂 𝚅𝟷 𝙱𝙾𝚃 🌀   │
├──────────────────────────────┤
│ 𝐻𝑜𝑙𝑎~ 𝑠𝑜𝑦 %botname
│ *%name*, %greeting
│
│ 🐉 𝑇𝑖𝑝𝑜: %tipo
│ ⚡ 𝑁𝑖𝑣𝑒𝑙: %level
│ 📅 %date
│ 🕐 %time
│ ⏱️ %uptime
├──────────────────────────────┤
│    🌀 𝙲𝙾𝙼𝙰𝙽𝙳𝙾𝚂 🌀     │
├──────────────────────────────┤
│ ⚡ 𝙴𝙲𝙾𝙽𝙾𝙼𝚈
│   🌀 %prefixdaily - Recompensa diaria
│   🌀 %prefixweekly - Recompensa semanal
│   🌀 %prefixmonthly - Recompensa mensual
│   🌀 %prefixritual - Invocar ritual
│   🌀 %prefixrt - Ruleta
│   🌀 %prefixcrime - Robo
│   🌀 %prefixslut - Prostituirse
│   🌀 %prefixwork - Trabajar
│   🌀 %prefixdungeon - Mazmorra
│   🌀 %prefixmine - Minar
│   🌀 %prefixfish - Pescar
│   🌀 %prefixadventure - Aventura
│   🌀 %prefixeinfo - Info economía
│   🌀 %prefixbal - Ver balance
│   🌀 %prefixbaltop - Ranking economy
│   🌀 %prefixpay - Transferir coins
│   🌀 %prefixdep - Depositar coins
│   🌀 %prefixwithdraw - Retirar coins
│   🌀 %prefixshop - Tienda
│   🌀 %prefixinv - Inventario
│   🌀 %prefixppt - Piedra, papel o tijera
│   🌀 %prefixslot - Tragamonedas
│
│ ⚡ 𝙶𝙰𝙲𝙷𝙰
│   🌀 %prefixrw - Roll waifu
│   🌀 %prefixc - Reclamar waifu
│
│ ⚡ 𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰𝚂
│   🌀 %prefixplay - Audio YouTube
│   🌀 %prefixplay2 - Video YouTube
│   🌀 %prefixfb - Video Facebook
│   🌀 %prefixtiktok - Video TikTok
│
│ ⚡ 𝚂𝙴𝙰𝚁𝙲𝙷
│   🌀 %prefixtiktoksearch - Buscar TikTok
│   🌀 %prefixapk - Buscar APK
│   🌀 %prefixytsearch - Buscar YouTube
│
│ ⚡ 𝚂𝚃𝙸𝙲𝙺𝙴𝚁𝚂
│   🌀 %prefixs - Convertir imagen a sticker
│
│ ⚡ 𝙸𝙽𝙵𝙾
│   🌀 %prefixmenu - Menú principal
│   🌀 %prefixping - Velocidad del bot
│
│ ⚡ 𝙾𝚆𝙽𝙴𝚁
│   🌀 %prefixupdate - Actualizar bot
│   🌀 %prefixrestart - Reiniciar bot
├──────────────────────────────┤
│ 🐉 𝐺𝑜𝑡𝑒𝑛𝑘𝑠 𝑉1 𝐵𝑜𝑡
│ 📺 %channelName
◣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◢
*𝐹𝑢𝑠𝑖𝑜𝑛 𝐻𝑎!* 🌀🐉
`;

export default {
  command: ['menu', 'help', 'menú', 'ayuda', 'comandos', 'gotenksmenu'],
  category: 'info',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const { exp, limit, level } = global.db.data.users[m.sender] || {};
      const { min, xp, max } = xpRange(level || 0, global.multiplier || 1);
      const name = m.pushName || 'Usuario';

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
      
      let nombreBot = botSettings.namebot || 'Gotenks V1';
      const canalId = botSettings.id || '120363404707199986@newsletter';
      const canalName = botSettings.nameid || '✦ Gotenks V1 Bot 🐉🌀';

      const imagePath = join(process.cwd(), 'lib', 'gotenks.jpg');
      let bannerFinal = null;
      if (fs.existsSync(imagePath)) {
        bannerFinal = fs.readFileSync(imagePath);
      }

      const isOficialBot = botId === (global.client?.user?.id?.split(':')[0] + '@s.whatsapp.net');
      const tipo = isOficialBot ? '🐉 GOTENKS PRINCIPAL' : '🌀 SUB GOTENKS';

      let uptimeSeconds = 0;
      if (global.startTime) {
        uptimeSeconds = (Date.now() - global.startTime) / 1000;
      } else {
        uptimeSeconds = process.uptime();
      }
      const uptime = clockString(uptimeSeconds * 1000);

      let menu = defaultMenu
        .replace(/%botname/g, nombreBot)
        .replace(/%name/g, name)
        .replace(/%greeting/g, getUwUGreeting(horaVenezuela.getHours()))
        .replace(/%tipo/g, tipo)
        .replace(/%level/g, level || 0)
        .replace(/%date/g, date)
        .replace(/%time/g, time)
        .replace(/%uptime/g, uptime)
        .replace(/%prefix/g, usedPrefix)
        .replace(/%channelName/g, canalName);

      const messageContent = {
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: canalId,
            newsletterName: canalName,
            serverMessageId: ''
          }
        }
      };

      if (bannerFinal) {
        messageContent.image = bannerFinal;
        messageContent.caption = menu;
      } else {
        messageContent.text = menu;
      }

      await client.sendMessage(m.chat, messageContent, { quoted: m });

    } catch (e) {
      console.error('Error en menu Gotenks:', e);
      await client.reply(m.chat, 
        `🐉🌀 *¡Ups! Algo salió mal*\n\n⚡ Error: ${e.message}`, 
        m
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

function getUwUGreeting(hour) {
  const greetings = {
    0: 'una noche mágica bajo las estrellas 🌙✨',
    1: 'una noche de sueños Saiyan 💤🌀',
    2: 'una noche llena de energía Ki 🌌⚡',
    3: 'un amanecer en la Sala del Tiempo 🌅⏳',
    4: 'un amanecer de meditación 🧘🌀',
    5: 'un entrenamiento con King Kai 👑🌅',
    6: 'una mañana de Kamehameha en la playa 🏖️🌀',
    7: 'una mañana en Kame House 🏠🐢',
    8: 'una mañana volando en Nimbus ☁️🌀',
    9: 'una mañana en el Tenkaichi Budokai 🥋🎯',
    10: 'un día de batalla en Cell Games ⚔️💥',
    11: 'un día de Torneo del Poder 💪🌟',
    12: 'un día soleado en Namek 🌍☀️',
    13: 'una tarde de entrenamiento con Whis 🥛🌀',
    14: 'una tarde en la Cámara Hipertérmica ⏱️✨',
    15: 'una tarde de fusiones en el dojo 🔄🌸',
    16: 'una tarde de transformaciones Saiyan 🌀💫',
    17: 'un atardecer después del Genkidama 🌇⚡',
    18: 'una noche de recuperación en la cápsula 💊🏥',
    19: 'una noche viendo las estrellas Saiyan 🌠🐉',
    20: 'una noche de cuentos del Planeta Vegeta 🪐📖',
    21: 'una noche preparando Semillas Senzu 🌱🍡',
    22: 'una noche protegiendo la Tierra 🌎🛡️',
    23: 'una noche de vigilia Saiyan 🌃🌸',
  };
  return 'Espero que tengas ' + (greetings[hour] || 'un día increíble lleno de poder Saiyan~ 🌸✨');
}