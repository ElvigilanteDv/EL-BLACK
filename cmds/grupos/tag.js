export default {
  command: ['tag'],
  run: async (client, m) => {
    const jid = m.key.remoteJid
    const reply = (text) =>
      client.sendMessage(jid, { text }, { quoted: m })

    try {
      // Verificar grupo
      if (!jid.endsWith('@g.us')) {
        return reply('❌ Este comando solo puede usarse en grupos.')
      }

      // Obtener metadata del grupo
      const metadata = await client.groupMetadata(jid)

      // Verificar si quien ejecuta es admin
      const sender = m.key.participant || m.key.remoteJid
      const senderData = metadata.participants.find(p => p.id === sender)
      if (!senderData?.admin) {
        return reply('🚫 Solo los administradores pueden usar este comando.')
      }

      // Obtener todos los miembros
      const members = metadata.participants.map(p => p.id)

      // Texto opcional después del comando
      const msgText = m.text?.replace(/^\.\w+\s*/, '') || '¡Atención a todos!'

      // Enviar mensaje mencionando a todos
      await client.sendMessage(jid, {
        text: msgText,
        mentions: members
      }, { quoted: m })

    } catch (err) {
      console.error(err)
      await reply(`🔴 Error al etiquetar a todos:\n\`\`\`${err.message}\`\`\``)
    }
  }
}