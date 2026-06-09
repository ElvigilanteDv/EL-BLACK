export default {
  command: ['dungeon', 'mazmorra'],
  category: 'economy',
  description: 'Explorar los calabozos de Britannia para ganar monedas.',
  run: async (client, m, args, usedPrefix, command) => {
    const chat = global.db.data.chats[m.chat];

    // ❌ Economía desactivada
    if (chat.adminonly || !chat.economy) {
      return m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `╚══════════════════════╝\n\n` +
        `🚫 *Economía desactivada*\n` +
        `en este reino.\n\n` +
        `🛡️ Un *Caballero Sagrado* puede\n` +
        `activarla con:\n` +
        `» *${usedPrefix}economy on*\n\n` +
        `❝ Sin monedas no hay\n` +
        `   poder, Pecador. ❞`
      )
    }

    const botId    = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const currency = global.db.data.settings[botId].currency;
    const user     = global.db.data.chats[m.chat].users[m.sender];

    // 🔧 Inicializar armas
    if (!user.weapons) user.weapons = {};
    if (typeof user.weapons === 'string') {
      try { user.weapons = JSON.parse(user.weapons); } catch { user.weapons = {}; }
    }
    if (!user.lastdungeon) user.lastdungeon = 0;

    // ⚡ Sin stamina
    const staminaConsumed = Math.floor(Math.random() * 5) + 1;
    if (user.stamina < staminaConsumed) {
      return m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `╚══════════════════════╝\n\n` +
        `😮‍💨 *Stamina agotada*\n\n` +
        `No tienes energía suficiente\n` +
        `para entrar al calabozo.\n\n` +
        `💡 Usa *${usedPrefix}heal* para\n` +
        `recuperar tu stamina.\n\n` +
        `❝ Un guerrero cansado\n` +
        `   es presa fácil. ❞`
      )
    }

    // ⚔️ Verificar hacha o magia
    let usingMagic  = false;
    let usingWeapon = false;

    if (user.weapons?.hacha) {
      if (user.weapons.hacha.durability <= 10) {
        delete user.weapons.hacha;
        return m.reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `🪓 *¡Tu Hacha se ha roto!*\n\n` +
          `La durabilidad llegó a cero\n` +
          `en la última batalla.\n\n` +
          `💡 Compra una nueva:\n` +
          `» *${usedPrefix}buy hacha*\n\n` +
          `❝ Sin arma no hay\n` +
          `   calabozo que explorar. ❞`
        )
      }
      usingWeapon = true;
    } else {
      const magicConsumed = Math.floor(Math.random() * 12) + 1;
      if (user.magic < magicConsumed) {
        return m.reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `🔮 *¡Sin magia ni hacha!*\n\n` +
          `No puedes enfrentarte a las\n` +
          `criaturas del calabozo así.\n\n` +
          `💡 Opciones:\n` +
          `┣ *${usedPrefix}heal* — Recuperar magia\n` +
          `┗ *${usedPrefix}buy hacha* — Comprar hacha\n\n` +
          `❝ El poder tiene\n` +
          `   sus límites. ❞`
        )
      }
      usingMagic = true;
      user.magic -= magicConsumed;
    }

    // ❤️ Sin salud
    if (user.health < 5) {
      return m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `╚══════════════════════╝\n\n` +
        `💔 *Salud crítica*\n\n` +
        `Estás demasiado herido para\n` +
        `entrar al calabozo.\n\n` +
        `💡 Usa *${usedPrefix}heal* para\n` +
        `recuperarte primero.\n\n` +
        `❝ Un guerrero herido\n` +
        `   es un guerrero muerto. ❞`
      )
    }

    // ⏳ Cooldown
    if (Date.now() < user.lastdungeon) {
      const restante = user.lastdungeon - Date.now();
      return m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `╚══════════════════════╝\n\n` +
        `⏳ *Calabozo en descanso*\n\n` +
        `🕐 Espera: *${msToTime(restante)}*\n` +
        `antes de volver a explorar.\n\n` +
        `❝ Las mazmorras también\n` +
        `   necesitan tiempo. ❞`
      )
    }

    user.stamina -= staminaConsumed;

    const rand             = Math.random();
    let cantidad           = 0;
    let salud              = Math.floor(Math.random() * 15) + 1;
    let durabilityConsumed = Math.floor(Math.random() * 15) + 1;

    // ✅ Victorias — calabozos de Britannia
    const victorias = [
      { lugar: '🏰 Calabozo del Castillo de Liones',    hazaña: 'Derrotaste al guardián de las ruinas reales' },
      { lugar: '👁️ Cripta de los Mandamientos',         hazaña: 'Descifraste los símbolos rúnicos prohibidos' },
      { lugar: '🐍 Mazmorra del Clan Demonio',           hazaña: 'El espíritu ancestral te bendijo con riquezas' },
    ]

    // ❌ Derrotas — calabozos de Britannia
    const derrotas = [
      { lugar: '💀 Cámara de los Espectros',             hazaña: 'Un espectro demoníaco te drenó la energía' },
      { lugar: '🦎 Guarida del Basilisco Sagrado',       hazaña: 'La criatura te sorprendió en la oscuridad' },
      { lugar: '🕸️ Túneles de las Bestias Antiguas',    hazaña: 'Una criatura te robó el botín del tesoro' },
    ]

    // 🌀 Neutrales — calabozos de Britannia
    const neutrales = [
      { lugar: '🗺️ Sala de Trampas del Reino',          hazaña: 'Activaste una trampa pero lograste esquivarla' },
      { lugar: '🌀 Cámara Cambiante de Camelot',         hazaña: 'La sala se transformó y perdiste el camino' },
      { lugar: '📜 Galería de Murales Antiguos',         hazaña: 'Encontraste secretos grabados en piedra milenaria' },
    ]

    let resultado, escenario;

    if (rand < 0.4) {
      // ✅ Victoria
      if (usingWeapon) {
        user.weapons.hacha.durability -= durabilityConsumed;
        if (user.weapons.hacha.durability <= 10) delete user.weapons.hacha;
      }
      cantidad      = Math.floor(Math.random() * (15000 - 12000 + 1)) + 12000;
      user.coins    = (user.coins  || 0) + cantidad;
      user.health   = (user.health || 100) - salud;
      if (user.health < 0) user.health = 0;
      resultado = 'victoria';
      escenario = pickRandom(victorias);

    } else if (rand < 0.7) {
      // ❌ Derrota
      if (usingWeapon) {
        user.weapons.hacha.durability -= durabilityConsumed;
        if (user.weapons.hacha.durability <= 10) delete user.weapons.hacha;
      }
      cantidad = Math.floor(Math.random() * (9000 - 7500 + 1)) + 7500;
      const total = (user.coins || 0) + (user.bank || 0);
      if (total >= cantidad) {
        if (user.coins >= cantidad) {
          user.coins -= cantidad;
        } else {
          const restante = cantidad - (user.coins || 0);
          user.coins = 0;
          user.bank  = (user.bank || 0) - restante;
        }
      } else {
        cantidad   = total;
        user.coins = 0;
        user.bank  = 0;
      }
      user.health = (user.health || 100) - salud;
      if (user.health < 0) user.health = 0;
      resultado = 'derrota';
      escenario = pickRandom(derrotas);

    } else {
      // 🌀 Neutral
      resultado = 'neutral';
      escenario = pickRandom(neutrales);
    }

    user.lastdungeon = Date.now() + (17 * 60 * 1000);

    // 📊 Stats actuales
    const statsLine =
      `┣ ❤️ *Salud:* ${user.health}/100\n` +
      `┣ ⚡ *Stamina:* ${user.stamina}/100\n` +
      `┣ 🔮 *Magia:* ${user.magic}/100\n` +
      `┗ 🪓 *Arma:* ${usingWeapon ? `Hacha (${user.weapons?.hacha?.durability || 0} dur.)` : usingMagic ? 'Magia' : 'Sin arma'}`

    if (resultado === 'victoria') {
      await m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `   🏰 *CALABOZO DE BRITANNIA*\n` +
        `╚══════════════════════╝\n\n` +
        `✅ *¡Victoria, Pecador!*\n\n` +
        `┣ 🏰 *Lugar:* ${escenario.lugar}\n` +
        `┣ 📖 *Hazaña:* ${escenario.hazaña}\n` +
        `┣ 💰 *Ganancia:* +${cantidad.toLocaleString()} ${currency}\n` +
        `┗ 💔 *Daño recibido:* -${salud} HP\n\n` +
        `📊 *Estado actual:*\n` +
        `${statsLine}\n\n` +
        `⏳ *Próximo calabozo en:* 17 min\n\n` +
        `❝ Las mazmorras guardan\n` +
        `   grandes tesoros. ❞`
      )
    } else if (resultado === 'derrota') {
      await m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `   🏰 *CALABOZO DE BRITANNIA*\n` +
        `╚══════════════════════╝\n\n` +
        `❌ *¡Derrota, Pecador!*\n\n` +
        `┣ 🏰 *Lugar:* ${escenario.lugar}\n` +
        `┣ 📖 *Suceso:* ${escenario.hazaña}\n` +
        `┣ 💸 *Pérdida:* -${cantidad.toLocaleString()} ${currency}\n` +
        `┗ 💔 *Daño recibido:* -${salud} HP\n\n` +
        `📊 *Estado actual:*\n` +
        `${statsLine}\n\n` +
        `⏳ *Próximo calabozo en:* 17 min\n\n` +
        `❝ Las sombras del calabozo\n` +
        `   te vencieron hoy. ❞`
      )
    } else {
      await m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `   🏰 *CALABOZO DE BRITANNIA*\n` +
        `╚══════════════════════╝\n\n` +
        `🌀 *Exploración neutral*\n\n` +
        `┣ 🏰 *Lugar:* ${escenario.lugar}\n` +
        `┗ 📖 *Suceso:* ${escenario.hazaña}\n\n` +
        `📊 *Estado actual:*\n` +
        `${statsLine}\n\n` +
        `⏳ *Próximo calabozo en:* 17 min\n\n` +
        `❝ No toda exploración\n` +
        `   trae riquezas. ❞`
      )
    }
  }
};

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const min = minutes < 10 ? '0' + minutes : minutes;
  const sec = seconds < 10 ? '0' + seconds : seconds;
  return min === '00'
    ? `${sec} segundo${sec > 1 ? 's' : ''}`
    : `${min} minuto${min > 1 ? 's' : ''}, ${sec} segundo${sec > 1 ? 's' : ''}`;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}