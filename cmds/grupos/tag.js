export default {
  command: ['tag'],
  run: async (client, m) => {
    const jid = m.key.remoteJid
    const reply = (text) =>
      client.sendMessage(jid, { text }, { quoted: m })

    try {
      // Verificar que sea grupo
      if (!jid.endsWith('@g.us')) {
        return reply('❌ Este comando solo puede usarse en grupos.')
      }

      // Obtener metadata del grupo
      const metadata = await client.groupMetadata(jid)

      // Obtener todos los miembros
      const members = metadata.participants.map(p => p.id)

      // Mensaje opcional después del comando
      const msgText = m.text?.replace(/^\.\w+\s*/, '') || '📢 Atención a todos los miembros del grupo!'

      // Enviar mensaje mencionando a todos
      await client.sendMessage(
        jid,
        {
          text: msgText,
          mentions: members
        },
        { quoted: m }
      )

    } catch (err) {
      console.error(err)
      await reply(`🔴 Error al etiquetar a todos:\n\`\`\`${err.message}\`\`\``)
    }
  }
}