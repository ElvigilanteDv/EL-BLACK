export default {
  command: ['dep', 'deposit', 'd', 'depositar'],
  category: 'economy',
  description: 'Depositar monedas en el cofre del reino.',
  run: async (client, m, args, usedPrefix, command) => {
    const chatData = global.db.data.chats[m.chat];

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

    const botId   = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const monedas = global.db.data.settings[botId].currency;
    const user    = global.db.data.chats[m.chat].users[m.sender];

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

    // ❌ Sin cantidad
    if (!args[0]) {
      return m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `   🏦 *COFRE DEL REINO*\n` +
        `╚══════════════════════╝\n\n` +
        `⚠️ *Indica cuánto depositar*\n\n` +
        `💡 Uso:\n` +
        `┣ *${usedPrefix}dep <cantidad>*\n` +
        `┗ *${usedPrefix}dep all* — Todo\n\n` +
        `📌 Ejemplo:\n` +
        `» *${usedPrefix}dep 5000*\n\n` +
        `👛 *En cartera:* ${(user.coins || 0).toLocaleString()} ${monedas}\n\n` +
        `❝ Protege tu tesoro,\n` +
        `   Pecador. ❞`
      )
    }

    // 💰 Depositar todo
    if (args[0].toLowerCase() === 'all') {
      if ((user.coins || 0) <= 0) {
        return m.reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `💸 *Cartera vacía*\n\n` +
          `No tienes ${monedas} en\n` +
          `tu cartera para depositar.\n\n` +
          `❝ No puedes guardar\n` +
          `   lo que no tienes. ❞`
        )
      }

      const count = user.coins;
      user.coins  = 0;
      user.bank   = (user.bank || 0) + count;

      return m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `   🏦 *COFRE DEL REINO*\n` +
        `╚══════════════════════╝\n\n` +
        `✅ *¡Depósito exitoso!*\n\n` +
        `┣ 💰 *Depositado:* ${count.toLocaleString()} ${monedas}\n` +
        `┣ 👛 *Cartera:* 0 ${monedas}\n` +
        `┗ 🏦 *Banco:* ${user.bank.toLocaleString()} ${monedas}\n\n` +
        `❝ Tu tesoro está a salvo\n` +
        `   en el cofre real. ❞`
      )
    }

    // ❌ Cantidad inválida
    const count = parseInt(args[0]);
    if (isNaN(count) || count < 1) {
      return m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `╚══════════════════════╝\n\n` +
        `⚠️ *Cantidad inválida*\n\n` +
        `Ingresa un número mayor a 0.\n\n` +
        `📌 Ejemplo: *${usedPrefix}dep 1000*\n\n` +
        `❝ El reino no acepta\n` +
        `   números mágicos. ❞`
      )
    }

    // ❌ Sin fondos suficientes
    if ((user.coins || 0) < count) {
      return m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `╚══════════════════════╝\n\n` +
        `💸 *Fondos insuficientes*\n\n` +
        `┣ 💳 *Intentas depositar:* ${count.toLocaleString()} ${monedas}\n` +
        `┗ 👛 *Tienes en cartera:* ${(user.coins || 0).toLocaleString()} ${monedas}\n\n` +
        `❝ No puedes dar más\n` +
        `   de lo que tienes. ❞`
      )
    }

    // ✅ Depósito exitoso
    user.coins = (user.coins || 0) - count;
    user.bank  = (user.bank  || 0) + count;

    await m.reply(
      `╔══════════════════════╗\n` +
      `   ⚔️ *NANATSU BOT - MD*\n` +
      `   🏦 *COFRE DEL REINO*\n` +
      `╚══════════════════════╝\n\n` +
      `✅ *¡Depósito exitoso!*\n\n` +
      `┣ 💰 *Depositado:* ${count.toLocaleString()} ${monedas}\n` +
      `┣ 👛 *Cartera:* ${user.coins.toLocaleString()} ${monedas}\n` +
      `┗ 🏦 *Banco:* ${user.bank.toLocaleString()} ${monedas}\n\n` +
      `❝ Tu tesoro está a salvo\n` +
      `   en el cofre real. ❞`
    )
  }
};