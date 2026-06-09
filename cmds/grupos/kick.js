export default {
  command: ['kick', 'expulsar'],

  run: async (client, m) => {
    const jid = m.key.remoteJid
    const reply = (text) =>
      client.sendMessage(jid, { text }, { quoted: m })

    try {
      if (!jid.endsWith('@g.us')) {
        return reply('❌ Solo funciona en grupos.')
      }

      const metadata = await client.groupMetadata(jid)

      // 🔥 ESTE ES EL PUNTO CLAVE (más compatible)
      const sender =
        m.key.participant ||
        m.participant ||
        m.sender

      // Buscar info del usuario correctamente
      const senderData = metadata.participants.find(p =>
        p.id === sender
      )

      // ❗ DEBUG (IMPORTANTE: deja esto 1 vez para ver qué pasa)
      console.log('SENDER =>', sender)
      console.log('PARTICIPANTS =>', metadata.participants)

      if (!senderData || (senderData.admin !== 'admin' && senderData.admin !== 'superadmin')) {
        return reply('🚫 Solo los administradores pueden usar este comando.')
      }

      // Bot admin check
      const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
      const botData = metadata.participants.find(p => p.id === botId)

      if (!botData || !botData.admin) {
        return reply('⚠️ Necesito ser administrador para expulsar.')
      }

      // Menciones
      const mentioned =
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

      if (!mentioned.length) {
        return reply('⚔️ Usa: .kick @usuario')
      }

      const expulsados = []
      const protegidos = []

      for (const user of mentioned) {
        const member = metadata.participants.find(p => p.id === user)

        if (!member) continue

        if (member.admin || user === botId) {
          protegidos.push(user)
          continue
        }

        await client.groupParticipantsUpdate(jid, [user], 'remove')
        expulsados.push(user)
      }

      await client.sendMessage(jid, {
        text:
          `⚔️ *KICK EJECUTADO*\n\n` +
          `✅ Expulsados: ${expulsados.length}\n` +
          `🛡️ Protegidos: ${protegidos.length}`,
        mentions: [...expulsados, ...protegidos]
      }, { quoted: m })

    } catch (err) {
      console.error(err)
      await reply(`❌ Error:\n${err.message}`)
    }
  }
}