export default {
  command: ['balance', 'bal', 'coins', 'bank'],
  category: 'economy',
  description: 'Ver cuántas monedas tienes en el reino.',
  run: async (client, m, args, usedPrefix, command) => {
    const chatId      = m.chat;
    const chatData    = global.db.data.chats[chatId];
    const botId       = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = global.db.data.settings[botId];
    const monedas     = botSettings.currency;

    // ❌ Economía desactivada
    if (chatData.adminonly || !chatData.economy) {
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

    const who  = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
    const user = global.db.data.chats[chatId]?.users?.[who];

    // ❌ Usuario no registrado
    if (!user) {
      return m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `╚══════════════════════╝\n\n` +
        `💀 *Pecador no registrado*\n\n` +
        `Este guerrero aún no\n` +
        `forma parte del reino.\n\n` +
        `💡 Usa *${usedPrefix}work* para\n` +
        `comenzar tu aventura.\n\n` +
        `❝ Todo Pecado tuvo\n` +
        `   un inicio. ❞`
      )
    }

    const users = global.db.data.users[who];
    const coins = user.coins || 0
    const bank  = user.bank  || 0
    const total = coins + bank

    // 🏅 Rango según riqueza
    let rango = '🌱 Campesino'
    if (total >= 1000000)     rango = '👑 Rey de Britannia'
    else if (total >= 500000) rango = '🔱 Pecado Capital'
    else if (total >= 250000) rango = '⚔️ Caballero Sagrado'
    else if (total >= 100000) rango = '🛡️ Soldado del Reino'
    else if (total >= 50000)  rango = '🗡️ Escudero'
    else if (total >= 10000)  rango = '🌀 Iniciado'

    // 📊 Porcentaje en banco
    const pctBanco = total > 0 ? Math.round((bank / total) * 100) : 0
    const progreso = Math.floor(pctBanco / 10)
    const barra    = '█'.repeat(progreso) + '░'.repeat(10 - progreso)

    await m.reply(
      `╔══════════════════════╗\n` +
      `   ⚔️ *NANATSU BOT - MD*\n` +
      `   💰 *TESORO DEL REINO*\n` +
      `╚══════════════════════╝\n\n` +
      `👤 *Pecador:* ${users?.name || who.split('@')[0]}\n` +
      `🏅 *Rango:* ${rango}\n\n` +
      `┣ 👛 *Cartera:* ${coins.toLocaleString()} ${monedas}\n` +
      `┣ 🏦 *Banco:* ${bank.toLocaleString()} ${monedas}\n` +
      `┗ 💎 *Total:* ${total.toLocaleString()} ${monedas}\n\n` +
      `📊 *Seguridad del tesoro:*\n` +
      `┗ [${barra}] ${pctBanco}% protegido\n\n` +
      `💡 Protege tu tesoro:\n` +
      `» *${usedPrefix}deposit <cantidad|all>*\n\n` +
      `❝ Las monedas son el poder\n` +
      `   del reino, Pecador. ❞`
    )
  }
};