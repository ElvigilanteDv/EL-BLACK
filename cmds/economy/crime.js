export default {
  command: ['crime', 'crimen'],
  category: 'economy',
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

    const botId  = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const monedas = global.db.data.settings[botId].currency;
    const user    = global.db.data.chats[m.chat].users[m.sender];
    if (!user.lastcrime) user.lastcrime = 0;

    // ⏳ Cooldown activo
    const remainingTime = user.lastcrime - Date.now();
    if (remainingTime > 0) {
      return m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `╚══════════════════════╝\n\n` +
        `⏳ *Misión en enfriamiento*\n\n` +
        `🕐 Espera: *${msToTime(remainingTime)}*\n` +
        `antes de intentar de nuevo.\n\n` +
        `❝ Un buen ladrón sabe\n` +
        `   cuándo esperar. ❞`
      )
    }

    const éxito   = Math.random() < 0.4;
    let cantidad;

    if (éxito) {
      cantidad   = Math.floor(Math.random() * (7500 - 5500 + 1)) + 5500;
      user.coins = (user.coins || 0) + cantidad;
    } else {
      cantidad   = Math.floor(Math.random() * (6000 - 4000 + 1)) + 4000;
      const total = (user.coins || 0) + (user.bank || 0);
      if (total >= cantidad) {
        if (user.coins >= cantidad) {
          user.coins = (user.coins || 0) - cantidad;
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
    }

    user.lastcrime = Date.now() + (7 * 60 * 1000);

    // ✅ Misiones exitosas — temática 7 Pecados
    const successMessages = [
      { mission: '🏰 Infiltraste el Castillo de Liones',    detail: 'Robaste las joyas de la corona' },
      { mission: '🐍 Engañaste a un mercader de Britannia', detail: 'Simulaste una venta de pociones mágicas' },
      { mission: '⚔️ Interceptaste un convoy real',         detail: 'Tomaste el oro del reino' },
      { mission: '🔮 Hackeaste el cofre de un Mandamiento', detail: 'Vaciaste sus monedas mágicas' },
      { mission: '🗡️ Te infiltraste en la Orden Sagrada',   detail: 'Robaste sus fondos secretos' },
    ]

    // ❌ Misiones fallidas — temática 7 Pecados
    const failMessages = [
      { mission: '🛡️ Intentaste robar en Camelot',          detail: 'Los Caballeros Sagrados te atraparon' },
      { mission: '👁️ Atacaste a un Mandamiento',            detail: 'Su poder te dejó sin monedas' },
      { mission: '🏹 Intentaste robar en el Bosque Sagrado', detail: 'Las hadas te castigaron' },
    ]

    if (éxito) {
      const m_ = pickRandom(successMessages)
      await m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `   🗡️ *MISIÓN DE CRIMEN*\n` +
        `╚══════════════════════╝\n\n` +
        `✅ *¡Misión exitosa, Pecador!*\n\n` +
        `┣ 🎯 *Misión:* ${m_.mission}\n` +
        `┣ 📖 *Detalle:* ${m_.detail}\n` +
        `┗ 💰 *Ganancia:* +${cantidad.toLocaleString()} ${monedas}\n\n` +
        `⏳ *Próxima misión en:* 7 minutos\n\n` +
        `❝ El crimen paga,\n` +
        `   por ahora. ❞`
      )
    } else {
      const m_ = pickRandom(failMessages)
      await m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `   🗡️ *MISIÓN DE CRIMEN*\n` +
        `╚══════════════════════╝\n\n` +
        `❌ *¡Misión fallida, Pecador!*\n\n` +
        `┣ 🎯 *Misión:* ${m_.mission}\n` +
        `┣ 📖 *Detalle:* ${m_.detail}\n` +
        `┗ 💸 *Pérdida:* -${cantidad.toLocaleString()} ${monedas}\n\n` +
        `⏳ *Próxima misión en:* 7 minutos\n\n` +
        `❝ Hasta los Pecados\n` +
        `   fallan a veces. ❞`
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