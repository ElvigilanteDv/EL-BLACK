export default {
  command: ['daily', 'diario'],
  category: 'rpg',
  run: async (client, m, args, usedPrefix) => {
    const chat = global.db.data.chats[m.chat]

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

    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const bot = global.db.data.settings[botId]
    const monedas = bot.currency

    let user  = global.db.data.chats[m.chat].users[m.sender]
    let users = global.db.data.users[m.sender]

    const now    = Date.now()
    const oneDay = 24 * 60 * 60 * 1000
    const maxStreak = 200

    users.streak          ??= 0
    users.lastDailyGlobal ??= 0
    user.coins            ??= 0
    user.lastdaily        ??= 0

    // ⏳ Ya reclamado hoy
    if (now < user.lastdaily) {
      const restante = formatRemainingTime(user.lastdaily - now)
      return m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `╚══════════════════════╝\n\n` +
        `⏳ *Ya reclamaste tu Daily*\n\n` +
        `🕐 Vuelve en: *${restante}*\n\n` +
        `❝ La paciencia forja\n` +
        `   a los grandes Pecados. ❞`
      )
    }

    // 💀 Racha perdida
    const lost = users.streak >= 1 && now - users.lastDailyGlobal > oneDay * 1.5
    if (lost) users.streak = 0

    const canClaimGlobal = now - users.lastDailyGlobal >= oneDay
    if (canClaimGlobal) {
      users.streak = Math.min(users.streak + 1, maxStreak)
      users.lastDailyGlobal = now
    }

    const recompensa = Math.min(20000 + (users.streak - 1) * 5000, 1015000)
    user.coins    += recompensa
    user.lastdaily = now + oneDay

    const siguiente = Math.min(20000 + users.streak * 5000, 1015000).toLocaleString()

    // 🏅 Rango de racha
    let rangoRacha = '🌱 Aprendiz'
    if (users.streak >= 150) rangoRacha = '👑 Pecado Capital'
    else if (users.streak >= 100) rangoRacha = '🔱 Caballero Sagrado'
    else if (users.streak >= 50)  rangoRacha = '⚔️ Guerrero del Reino'
    else if (users.streak >= 20)  rangoRacha = '🛡️ Soldado de Liones'
    else if (users.streak >= 10)  rangoRacha = '🗡️ Escudero'
    else if (users.streak >= 5)   rangoRacha = '🌀 Iniciado'

    // 🔥 Barra de racha visual
    const progreso = Math.min(Math.floor((users.streak / maxStreak) * 10), 10)
    const barra = '█'.repeat(progreso) + '░'.repeat(10 - progreso)

    let extra = ''
    if (lost) {
      extra =
        `\n⚠️ *¡Racha perdida!*\n` +
        `Pasaron más de 36h sin reclamar.\n`
    } else if (users.streak >= maxStreak) {
      extra = `\n👑 *¡Racha máxima alcanzada!*\n`
    }

    await m.reply(
      `╔══════════════════════╗\n` +
      `   ⚔️ *NANATSU BOT - MD*\n` +
      `   💰 *RECOMPENSA DIARIA*\n` +
      `╚══════════════════════╝\n\n` +
      `✅ *¡Daily reclamado, Pecador!*\n\n` +
      `┣ 💰 *Recompensa:* +${recompensa.toLocaleString()} ${monedas}\n` +
      `┣ 🔥 *Racha:* Día ${users.streak}\n` +
      `┣ 🏅 *Rango:* ${rangoRacha}\n` +
      `┣ 📊 *Progreso:*\n` +
      `┃  [${barra}] ${users.streak}/${maxStreak}\n` +
      `┗ ⚡ *Próximo día:* +${siguiente} ${monedas}\n` +
      `${extra}\n` +
      `❝ El poder crece con\n` +
      `   cada día, Pecador. ❞`
    )
  },
}

function formatRemainingTime(ms) {
  const s   = Math.floor(ms / 1000)
  const h   = Math.floor((s % 86400) / 3600)
  const min = Math.floor((s % 3600) / 60)
  const seg = s % 60
  const partes = []
  if (h)   partes.push(`${h} ${h === 1 ? 'hora' : 'horas'}`)
  if (min) partes.push(`${min} ${min === 1 ? 'minuto' : 'minutos'}`)
  if (seg || partes.length === 0) partes.push(`${seg} ${seg === 1 ? 'segundo' : 'segundos'}`)
  return partes.join(' ')
}