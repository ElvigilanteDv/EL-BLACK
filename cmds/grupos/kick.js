export default {
  command: ['kick', 'expulsar'],

  run: async (client, m) => {
    const jid = m.key.remoteJid
    const reply = (text) =>
      client.sendMessage(jid, { text }, { quoted: m })

    try {
      // Solo grupos
      if (!jid.endsWith('@g.us')) {
        return reply('❌ Este comando solo funciona en grupos.')
      }

      const metadata = await client.groupMetadata(jid)

      // 👇 MEJOR FORMA DE DETECTAR AL USUARIO
      const sender =
        m.sender ||
        m.key.participant ||
        m.participant ||
        m.key.remoteJid

      // Buscar si es admin (FORMA MÁS SEGURA)
      const isAdmin = metadata.participants.some(p =>
        p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )

      if (!isAdmin) {
        return reply('🚫 Solo los administradores pueden usar este comando.')
      }

      // Bot number
      const botNumber =
        client.user?.id?.split(':')[0] + '@s.whatsapp.net'

      const botIsAdmin = metadata.participants.some(p =>
        p.id === botNumber && (p.admin === 'admin' || p.admin === 'superadmin')
      )

      if (!botIsAdmin) {
        return reply('⚠️ Necesito ser administrador para expulsar usuarios.')
      }

      // Menciones
      const mentioned =
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

      if (!mentioned.length) {
        return reply(
          '⚔️ Uso correcto:\n.kick @usuario'
        )
      }

      const expulsados = []
      const protegidos = []

      for (const user of mentioned) {
        const member = metadata.participants.find(p => p.id === user)

        if (!member) continue

        // No expulsar admins ni bot
        if (member.admin || user === botNumber) {
          protegidos.push(user)
          continue
        }

        await client.groupParticipantsUpdate(jid, [user], 'remove')
        expulsados.push(user)
      }

      let text =
        `╔══════════════════════╗\n` +
        `   ✦ *NANATSU BOT - MD* ✦\n` +
        `╚══════════════════════╝\n\n` +
        `⚔️ *Sistema de Moderación*\n\n`

      if (expulsados.length) {
        text +=
          `✅ *Expulsados:*\n` +
          expulsados.map(u => `• @${u.split('@')[0]}`).join('\n') +
          '\n\n'
      }

      if (protegidos.length) {
        text +=
          `🛡️ *Protegidos:*\n` +
          protegidos.map(u => `• @${u.split('@')[0]}`).join('\n') +
          '\n\n'
      }

      text += `❝ La justicia ha sido ejecutada. ❞`

      await client.sendMessage(
        jid,
        {
          text,
          mentions: [...expulsados, ...protegidos]
        },
        { quoted: m }
      )

    } catch (err) {
      console.error(err)

      await reply(
        `❌ Error en kick:\n\`\`\`${err.message}\`\`\``
      )
    }
  }
}