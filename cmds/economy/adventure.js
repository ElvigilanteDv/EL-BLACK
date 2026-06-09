export default {
  command: ['adventure', 'aventura'],
  category: 'economy',
  description: 'Ir de aventuras por Britannia para ganar monedas.',
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
    const settings = global.db.data.settings[botId];
    const currency = settings.currency;

    let user = global.db.data.chats[m.chat].users[m.sender];

    // ❌ No registrado
    if (!user) {
      return m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `╚══════════════════════╝\n\n` +
        `💀 *Pecador no registrado*\n\n` +
        `Aún no formas parte\n` +
        `del reino de Britannia.\n\n` +
        `💡 Usa *${usedPrefix}work* para\n` +
        `comenzar tu aventura.\n\n` +
        `❝ Todo gran Pecado\n` +
        `   tuvo un inicio. ❞`
      )
    }

    // 🔧 Inicializar stats
    if (!user.weapons)       user.weapons = {};
    if (typeof user.weapons === 'string') {
      try { user.weapons = JSON.parse(user.weapons); } catch { user.weapons = {}; }
    }
    if (!user.lastadventure) user.lastadventure = 0;
    if (!user.stamina)       user.stamina = 100;
    if (!user.health)        user.health  = 100;
    if (!user.magic)         user.magic   = 100;
    if (!user.coins)         user.coins   = 0;
    if (!user.bank)          user.bank    = 0;

    // ⚡ Sin stamina
    const staminaConsumed = Math.floor(Math.random() * 5) + 1;
    if (user.stamina < staminaConsumed) {
      return m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `╚══════════════════════╝\n\n` +
        `😮‍💨 *Stamina agotada*\n\n` +
        `No tienes energía suficiente\n` +
        `para aventurarte en Britannia.\n\n` +
        `💡 Usa *${usedPrefix}heal* para\n` +
        `recuperar tu stamina.\n\n` +
        `❝ Hasta Meliodas\n` +
        `   necesita descansar. ❞`
      )
    }

    // ❤️ Sin salud
    if (user.health < 5) {
      return m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `╚══════════════════════╝\n\n` +
        `💔 *Salud crítica*\n\n` +
        `Estás demasiado herido para\n` +
        `aventurarte por el reino.\n\n` +
        `💡 Usa *${usedPrefix}heal* para\n` +
        `recuperarte antes de salir.\n\n` +
        `❝ Un guerrero herido\n` +
        `   es un guerrero muerto. ❞`
      )
    }

    // ⚔️ Verificar arma o magia
    let usingMagic  = false;
    let usingWeapon = false;

    if (user.weapons?.espada) {
      if (user.weapons.espada.durability <= 10) {
        delete user.weapons.espada;
        return m.reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `🗡️ *¡Tu espada se ha roto!*\n\n` +
          `La durabilidad llegó a cero\n` +
          `en la última batalla.\n\n` +
          `💡 Compra una nueva:\n` +
          `» *${usedPrefix}buy espada*\n\n` +
          `❝ Un guerrero sin arma\n` +
          `   es presa fácil. ❞`
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
          `🔮 *¡Sin magia ni arma!*\n\n` +
          `No puedes enfrentarte a los\n` +
          `peligros de Britannia así.\n\n` +
          `💡 Compra un arma:\n` +
          `» *${usedPrefix}buy espada*\n\n` +
          `❝ El poder tiene\n` +
          `   sus límites. ❞`
        )
      }
      usingMagic = true;
      user.magic -= magicConsumed;
    }

    // ⏳ Cooldown
    const remainingTime = user.lastadventure - Date.now();
    if (remainingTime > 0) {
      return m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `╚══════════════════════╝\n\n` +
        `⏳ *Recuperándose del viaje*\n\n` +
        `🕐 Espera: *${msToTime(remainingTime)}*\n` +
        `antes de salir de nuevo.\n\n` +
        `❝ Britannia es grande,\n` +
        `   pero no infinita. ❞`
      )
    }

    user.stamina -= staminaConsumed;

    const rand               = Math.random();
    let cantidad             = 0;
    let salud                = Math.floor(Math.random() * 20) + 1;
    let durabilityConsumed   = Math.floor(Math.random() * 15) + 1;
    let resultado, escenario, detalle, emoji;

    // ✅ Victorias — temática 7 Pecados
    const victorias = [
      { escenario: '🏰 Castillo de Liones',      detalle: 'Derrotaste a los guardias y saqueaste el tesoro' },
      { escenario: '🌲 Bosque Sagrado de Fairies', detalle: 'Venciste a una bestia mágica protectora' },
      { escenario: '⚔️ Ruinas de Camelot',         detalle: 'Encontraste el cofre de un antiguo caballero' },
    ]

    // ❌ Derrotas — temática 7 Pecados
    const derrotas = [
      { escenario: '👁️ Territorio de los Mandamientos', detalle: 'Un Mandamiento te robó las monedas' },
      { escenario: '🐍 Guarida del Clan Demonio',        detalle: 'Los demonios te tendieron una trampa' },
      { escenario: '🏹 Camino a Liones',                 detalle: 'Bandidos del reino te asaltaron' },
    ]

    // 🌀 Neutrales — temática 7 Pecados
    const neutrales = [
      { escenario: '🗺️ Tierras de Britannia',    detalle: 'Exploraste sin encontrar riquezas ni peligros' },
      { escenario: '🌿 Valle de las Hadas',       detalle: 'Descubriste rutas secretas del reino' },
      { escenario: '📜 Biblioteca de Merlin',     detalle: 'Encontraste pergaminos de batallas antiguas' },
    ]

    if (rand < 0.4) {
      // ✅ Victoria
      if (usingWeapon) {
        user.weapons.espada.durability -= durabilityConsumed;
        if (user.weapons.espada.durability <= 10) delete user.weapons.espada;
      }
      cantidad     = Math.floor(Math.random() * (18000 - 14000 + 1)) + 14000;
      user.coins  += cantidad;
      user.health -= salud;
      if (user.health < 0) user.health = 0;
      resultado    = 'victoria';
      escenario    = pickRandom(victorias);
      emoji        = '✅';

    } else if (rand < 0.7) {
      // ❌ Derrota
      if (usingWeapon) {
        user.weapons.espada.durability -= durabilityConsumed;
        if (user.weapons.espada.durability <= 10) delete user.weapons.espada;
      }
      cantidad = Math.floor(Math.random() * (11000 - 9000 + 1)) + 9000;
      const total = (user.coins || 0) + (user.bank || 0);
      if (total >= cantidad) {
        if (user.coins >= cantidad) {
          user.coins -= cantidad;
        } else {
          const restante = cantidad - user.coins;
          user.coins = 0;
          user.bank -= restante;
        }
      } else {
        cantidad   = total;
        user.coins = 0;
        user.bank  = 0;
      }
      user.health -= salud;
      if (user.health < 0) user.health = 0;
      resultado = 'derrota';
      escenario = pickRandom(derrotas);
      emoji     = '❌';

    } else {
      // 🌀 Neutral
      resultado = 'neutral';
      escenario = pickRandom(neutrales);
      emoji     = '🌀';
    }

    user.lastadventure = Date.now() + 20 * 60 * 1000;

    // 📊 Stats actuales
    const statsLine =
      `┣ ❤️ *Salud:* ${user.health}/100\n` +
      `┣ ⚡ *Stamina:* ${user.stamina}/100\n` +
      `┣ 🔮 *Magia:* ${user.magic}/100\n` +
      `┗ 🗡️ *Arma:* ${usingWeapon ? `Espada (${user.weapons?.espada?.durability || 0} dur.)` : usingMagic ? 'Magia' : 'Sin arma'}`

    if (resultado === 'victoria') {
      await m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `   🗺️ *AVENTURA EN BRITANNIA*\n` +
        `╚══════════════════════╝\n\n` +
        `✅ *¡Victoria, Pecador!*\n\n` +
        `┣ 🏰 *Lugar:* ${escenario.escenario}\n` +
        `┣ 📖 *Hazaña:* ${escenario.detalle}\n` +
        `┣ 💰 *Ganancia:* +${cantidad.toLocaleString()} ${currency}\n` +
        `┗ 💔 *Daño recibido:* -${salud} HP\n\n` +
        `📊 *Estado actual:*\n` +
        `${statsLine}\n\n` +
        `⏳ *Próxima aventura en:* 20 min\n\n` +
        `❝ La victoria tiene\n` +
        `   su precio. ❞`
      )
    } else if (resultado === 'derrota') {
      await m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `   🗺️ *AVENTURA EN BRITANNIA*\n` +
        `╚══════════════════════╝\n\n` +
        `❌ *¡Derrota, Pecador!*\n\n` +
        `┣ 🏰 *Lugar:* ${escenario.escenario}\n` +
        `┣ 📖 *Suceso:* ${escenario.detalle}\n` +
        `┣ 💸 *Pérdida:* -${cantidad.toLocaleString()} ${currency}\n` +
        `┗ 💔 *Daño recibido:* -${salud} HP\n\n` +
        `📊 *Estado actual:*\n` +
        `${statsLine}\n\n` +
        `⏳ *Próxima aventura en:* 20 min\n\n` +
        `❝ Hasta los Pecados\n` +
        `   caen a veces. ❞`
      )
    } else {
      await m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `   🗺️ *AVENTURA EN BRITANNIA*\n` +
        `╚══════════════════════╝\n\n` +
        `🌀 *Aventura tranquila*\n\n` +
        `┣ 🏰 *Lugar:* ${escenario.escenario}\n` +
        `┗ 📖 *Suceso:* ${escenario.detalle}\n\n` +
        `📊 *Estado actual:*\n` +
        `${statsLine}\n\n` +
        `⏳ *Próxima aventura en:* 20 min\n\n` +
        `❝ No toda batalla\n` +
        `   trae gloria. ❞`
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