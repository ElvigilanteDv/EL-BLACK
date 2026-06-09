export default {
  command: ['ping', 'p', 'speed'],
  category: 'info',
  description: 'Mide la velocidad de respuesta del bot.',
  run: async (client, m, args, usedPrefix, command) => {
    const start = Date.now()
    await m.reply('⚔️ *Midiendo el poder del bot...*')
    const end = Date.now()
    const ping = end - start
    const apiPing = Math.round(client.ws?.ping || 0)

    // Nivel de poder según ping
    let nivel, emoji, pecado
    if (ping <= 100) {
      emoji = '🟢'
      nivel = 'Clase S — Caballero Sagrado'
      pecado = '⚔️ *Meliodas — Dragón de la Ira*'
    } else if (ping <= 200) {
      emoji = '🟢'
      nivel = 'Clase A — Caballero de Hierro'
      pecado = '🐗 *Escanor — León del Orgullo*'
    } else if (ping <= 400) {
      emoji = '🟡'
      nivel = 'Clase B — Caballero Común'
      pecado = '🦊 *Ban — Zorro de la Codicia*'
    } else if (ping <= 700) {
      emoji = '🟠'
      nivel = 'Clase C — Aprendiz'
      pecado = '🐍 *Merlin — Serpiente de la Gula*'
    } else {
      emoji = '🔴'
      nivel = 'Clase D — Civil Sin Poder'
      pecado = '🐑 *Gowther — Cabra de la Lujuria*'
    }

    const message = `
╔══════════════════════╗
   ✦ *NANATSU BOT - MD* ✦
   ⚔️ *LOS 7 PECADOS* ⚔️
╚══════════════════════╝

${pecado}

${emoji} *Velocidad del Bot*
┣ 📡 Ping: *${ping}ms*
┗ 🌐 WS: *${apiPing}ms*

🏅 *Nivel de Poder:*
┗ ${nivel}

❝ El poder no es todo,
  pero sin él no eres nada. ❞
        — *Meliodas*

╔══════════════════════╗
  🔱 *NanatsuBot-MD v1.0*
╚══════════════════════╝
`
    await m.reply(message)
  }
}