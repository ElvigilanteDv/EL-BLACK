export default {
  command: ['kick', 'expulsar'],
  run: async (client, m) => {
    const jid = m.key.remoteJid
    const reply = (text) => client.sendMessage(jid, { text }, { quoted: m })

    try {
      // Verificar que sea grupo
      if (!jid.endsWith('@g.us')) {
        return reply('❌ Este comando solo puede usarse en grupos.')
      }

      // Obtener metadata del grupo
      const metadata = await client.groupMetadata(jid)

      // Usuario que ejecuta el comando
      const sender = m.key.participant || m.participant || m.key.remoteJid
      const senderData = metadata.participants.find(p => p.id === sender)

      // Verificar que quien ejecuta sea admin
      if (!senderData?.admin) {
        return reply('🚫 Solo los administradores pueden usar este comando.')
      }

      // Verificar que el bot sea admin
      const botNumber = client.user.id.split(':')[0] + '@s.whatsapp.net'
      const botData = metadata.participants.find(p => p.id === botNumber)
      if (!botData?.admin) {
        return reply('⚠️ Necesito ser administrador para expulsar usuarios.')
      }

      // Usuarios mencionados
      const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
      if (!mentioned.length) {
        return reply(
          `⚔️ *Uso correcto:*\n\n.kick @usuario\n\n📌 Debes mencionar al usuario que deseas expulsar.`
        )
      }

      const expulsados = []
      const protegidos = []

      for (const user of mentioned) {
        const member = metadata.participants.find(p => p.id === user)
        if (!member) continue

        // No expulsar admins
        if (member.admin || user === botNumber) {
          protegidos.push(user)
          continue
        }

        await client.groupParticipantsUpdate(jid, [user], 'remove')
        expulsados.push(user)
      }

      // Construir mensaje final
      let text =
        `╔══════════════════════╗\n` +
        `   ✦ *NANATSU BOT - MD* ✦\n` +
        `╚══════════════════════╝\n\n⚔️ *Sistema de Moderación*\n\n`

      if (expulsados.length)
        text += `✅ *Usuarios expulsados:*\n` +
          expulsados.map(u => `• @${u.split('@')[0]}`).join('\n') + '\n\n'

      if (protegidos.length)
        text += `🛡️ *Usuarios protegidos:*\n` +
          protegidos.map(u => `• @${u.split('@')[0]}`).join('\n') + '\n\n'

      text += `❝ La justicia de los Pecados ha sido aplicada. ❞`

      await client.sendMessage(jid, { text, mentions: [...expulsados, ...protegidos] }, { quoted: m })

    } catch (err) {
      console.error(err)
      await reply(
        `╔══════════════════════╗\n` +
        `   ✦ *NANATSU BOT - MD* ✦\n` +
        `╚══════════════════════╝\n\n` +
        `🔴 *Error al expulsar usuario*\n\`\`\`${err.message}\`\`\`\n\n` +
        `❝ Incluso los Pecados pueden fallar. ❞`
      )
    }
  }
}