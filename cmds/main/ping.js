export default {
  command: ['ping', 'p', 'speed'],
  category: 'info',
  description: 'Mide la velocidad de respuesta del bot.',
  run: async (client, m, args, usedPrefix, command) => {
    const start = Date.now()
    await m.reply('⛩️ *Midiendo el poder de Wang Ling...*')
    const end = Date.now()
    const ping = end - start
    const apiPing = Math.round(client.ws?.ping || 0)

    let nivel, emoji, poder
    if (ping <= 100) {
      emoji = '🟢'
      nivel = 'Supresión Máxima — Poder Ilimitado'
      poder = '⚡ *Wang Ling — Cultivador Inmortal*'
    } else if (ping <= 200) {
      emoji = '🟢'
      nivel = 'Nivel Divino — Gran Cultivador'
      poder = '🌀 *Etapa Nascent Soul*'
    } else if (ping <= 400) {
      emoji = '🟡'
      nivel = 'Nivel Tierra — Cultivador Medio'
      poder = '🔥 *Etapa Golden Core*'
    } else if (ping <= 700) {
      emoji = '🟠'
      nivel = 'Nivel Mortal — Cultivador Común'
      poder = '💨 *Etapa Foundation Building*'
    } else {
      emoji = '🔴'
      nivel = 'Sin Qi — Mortal Sin Poder'
      poder = '😐 *Etapa Qi Condensation*'
    }

    const message = `
╭━━━〔 ⛩️ *WANG LING BOT* ⛩️ 〕━━━📌
┃
┃ ${poder}
┃
┃ ${emoji} *Velocidad del Bot*
┃ 📡 Ping: *${ping}ms*
┃ 🌐 WS: *${apiPing}ms*
┃
┃ 🏅 *Nivel de Poder:*
┃ ${nivel}
┃
┃ ❝ El poder verdadero
┃   no necesita ser mostrado. ❞
┃         — *Wang Ling*
┃
┗━━━━━━━━━━━━━━━━━━━━📌
`.trim()

    await m.reply(message)
  }
}