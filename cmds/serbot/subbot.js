import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import fs from 'fs'
import path from 'path'
import pino from 'pino'

const subBots = new Map() // Almacena sub bots activos

async function connectSubBot(sessionPath, onConnected) {
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['NanatsuBot-MD', 'Chrome', '1.0.0']
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update
    if (connection === 'open') {
      const id = sock.user.id.split(':')[0]
      subBots.set(id, sock)
      if (onConnected) onConnected(id, sock)
    }
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
      const id = sock?.user?.id?.split(':')[0]
      if (id) subBots.delete(id)
      if (reason !== DisconnectReason.loggedOut) {
        setTimeout(() => connectSubBot(sessionPath, onConnected), 5000)
      }
    }
  })

  return sock
}

export default {
  command: ['subbot', 'serbot', 'addbot'],
  category: 'owner',
  isOwner: true,
  description: 'Gestionar sub bots del reino ⚔️',
  run: async (client, m, args, usedPrefix, command) => {
    const jid = m.chat
    const reply = (text) => client.sendMessage(jid, { text }, { quoted: m })
    const sub = args[0]?.toLowerCase()

    // 📋 Sin subcomando — mostrar ayuda
    if (!sub) {
      return reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `   🤖 *GESTIÓN DE SUB BOTS*\n` +
        `╚══════════════════════╝\n\n` +
        `📋 *Comandos disponibles:*\n\n` +
        `┣ 🔗 *${usedPrefix}subbot qr* — Conectar con QR\n` +
        `┣ 🔑 *${usedPrefix}subbot code <número>* — Conectar con código\n` +
        `┣ 📊 *${usedPrefix}subbot list* — Ver sub bots activos\n` +
        `┗ ❌ *${usedPrefix}subbot kick <número>* — Desconectar sub bot\n\n` +
        `❝ Recluta guerreros para\n` +
        `   el reino, Pecador. ❞`
      )
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 LISTAR SUB BOTS
    // ━━━━━━━━━━━━━━━━━━━━━━━━
    if (sub === 'list') {
      if (subBots.size === 0) {
        return reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `💀 *Sin guerreros activos*\n\n` +
          `No hay sub bots conectados\n` +
          `al reino actualmente.\n\n` +
          `❝ Usa *${usedPrefix}subbot qr* para\n` +
          `   reclutar uno. ❞`
        )
      }

      let lista = ''
      let i = 1
      for (const [id] of subBots) {
        lista += `┣ ${i}. 📱 +${id}\n`
        i++
      }

      return reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `   🤖 *SUB BOTS ACTIVOS*\n` +
        `╚══════════════════════╝\n\n` +
        `⚔️ *Guerreros del reino:*\n\n` +
        `${lista}\n` +
        `📊 *Total:* ${subBots.size} sub bot(s)\n\n` +
        `❝ El reino crece con\n` +
        `   cada guerrero. ❞`
      )
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━
    // ❌ DESCONECTAR SUB BOT
    // ━━━━━━━━━━━━━━━━━━━━━━━━
    if (sub === 'kick') {
      const numero = args[1]?.replace(/[^0-9]/g, '')
      if (!numero) {
        return reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `⚠️ *Indica el número a desconectar*\n\n` +
          `💡 Uso: *${usedPrefix}subbot kick <número>*\n` +
          `📌 Ejemplo: *${usedPrefix}subbot kick 51912345678*`
        )
      }

      if (!subBots.has(numero)) {
        return reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `🔴 *Sub bot no encontrado*\n\n` +
          `📱 El número *+${numero}*\n` +
          `no está en el reino.\n\n` +
          `📊 Usa *${usedPrefix}subbot list* para\n` +
          `ver los activos.`
        )
      }

      try {
        const sock = subBots.get(numero)
        await sock.logout()
        subBots.delete(numero)

        // Eliminar sesión del disco
        const sessionPath = path.join(process.cwd(), 'Sessions', `SubBot_${numero}`)
        if (fs.existsSync(sessionPath)) {
          fs.rmSync(sessionPath, { recursive: true, force: true })
        }

        return reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `✅ *Sub bot desconectado*\n\n` +
          `📱 *+${numero}* ha abandonado\n` +
          `el reino exitosamente.\n\n` +
          `❝ Todo guerrero tiene\n` +
          `   su tiempo. ❞`
        )
      } catch (e) {
        return reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `🔴 *Error al desconectar*\n\n` +
          `\`\`\`${e.message}\`\`\``
        )
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔗 CONECTAR CON QR
    // ━━━━━━━━━━━━━━━━━━━━━━━━
    if (sub === 'qr') {
      await reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `╚══════════════════════╝\n\n` +
        `🔗 *Iniciando conexión QR*\n\n` +
        `⏳ Generando código...\n` +
        `Espera unos segundos.\n\n` +
        `❝ El reino te espera,\n` +
        `   nuevo guerrero. ❞`
      )

      const sessionId = `SubBot_${Date.now()}`
      const sessionPath = path.join(process.cwd(), 'Sessions', sessionId)
      fs.mkdirSync(sessionPath, { recursive: true })

      try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

        const sock = makeWASocket({
          auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
          },
          logger: pino({ level: 'silent' }),
          printQRInTerminal: false,
          browser: ['NanatsuBot-MD', 'Chrome', '1.0.0']
        })

        sock.ev.on('creds.update', saveCreds)

        // Timeout de 60 segundos
        const timeout = setTimeout(async () => {
          await sock.end()
          fs.rmSync(sessionPath, { recursive: true, force: true })
          await reply(
            `╔══════════════════════╗\n` +
            `   ⚔️ *NANATSU BOT - MD*\n` +
            `╚══════════════════════╝\n\n` +
            `⏰ *Tiempo agotado*\n\n` +
            `El QR expiró sin ser escaneado.\n` +
            `Usa *${usedPrefix}subbot qr* para reintentar.`
          )
        }, 60000)

        sock.ev.on('connection.update', async (update) => {
          const { connection, qr } = update

          if (qr) {
            const QRCode = (await import('qrcode')).default
            const qrBuffer = await QRCode.toBuffer(qr, { type: 'png', scale: 8 })
            await client.sendMessage(jid, {
              image: qrBuffer,
              caption:
                `╔══════════════════════╗\n` +
                `   ⚔️ *NANATSU BOT - MD*\n` +
                `   🔗 *ESCANEA EL QR*\n` +
                `╚══════════════════════╝\n\n` +
                `📱 Abre WhatsApp\n` +
                `⚙️ Dispositivos vinculados\n` +
                `➕ Vincular dispositivo\n` +
                `📷 Escanea este QR\n\n` +
                `⏳ *Expira en 60 segundos*\n\n` +
                `❝ Únete al reino,\n` +
                `   guerrero. ❞`
            }, { quoted: m })
          }

          if (connection === 'open') {
            clearTimeout(timeout)
            const id = sock.user.id.split(':')[0]
            subBots.set(id, sock)
            await reply(
              `╔══════════════════════╗\n` +
              `   ⚔️ *NANATSU BOT - MD*\n` +
              `╚══════════════════════╝\n\n` +
              `✅ *¡Sub bot conectado!*\n\n` +
              `📱 *Número:* +${id}\n` +
              `🤖 *Sesión:* ${sessionId}\n\n` +
              `❝ Un nuevo guerrero\n` +
              `   se une al reino. ❞`
            )
          }

          if (connection === 'close') {
            clearTimeout(timeout)
            const id = sock?.user?.id?.split(':')[0]
            if (id) subBots.delete(id)
          }
        })

      } catch (e) {
        fs.rmSync(sessionPath, { recursive: true, force: true })
        return reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `🔴 *Error al generar QR*\n\n` +
          `\`\`\`${e.message}\`\`\``
        )
      }
      return
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔑 CONECTAR CON CÓDIGO
    // ━━━━━━━━━━━━━━━━━━━━━━━━
    if (sub === 'code') {
      const numero = args[1]?.replace(/[^0-9]/g, '')
      if (!numero || numero.length < 8) {
        return reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `⚠️ *Indica el número*\n\n` +
          `💡 Uso: *${usedPrefix}subbot code <número>*\n` +
          `📌 Ejemplo: *${usedPrefix}subbot code 51912345678*\n\n` +
          `❝ Sin número no hay\n` +
          `   guerrero. ❞`
        )
      }

      await reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `╚══════════════════════╝\n\n` +
        `🔑 *Generando código*\n` +
        `para *+${numero}*...\n\n` +
        `⏳ Espera un momento.\n\n` +
        `❝ El reino invoca\n` +
        `   tu presencia. ❞`
      )

      const sessionId = `SubBot_${numero}`
      const sessionPath = path.join(process.cwd(), 'Sessions', sessionId)
      fs.mkdirSync(sessionPath, { recursive: true })

      try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

        const sock = makeWASocket({
          auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
          },
          logger: pino({ level: 'silent' }),
          printQRInTerminal: false,
          browser: ['NanatsuBot-MD', 'Chrome', '1.0.0']
        })

        sock.ev.on('creds.update', saveCreds)

        // Solicitar código de emparejamiento
        await sock.waitForConnectionUpdate(({ qr }) => !!qr)
        const code = await sock.requestPairingCode(numero)
        const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code

        await reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `   🔑 *CÓDIGO DE ACCESO*\n` +
          `╚══════════════════════╝\n\n` +
          `📱 *Número:* +${numero}\n\n` +
          `🔑 *Código:*\n` +
          `┗ *${formattedCode}*\n\n` +
          `📋 *Pasos:*\n` +
          `1️⃣ Abre WhatsApp\n` +
          `2️⃣ Dispositivos vinculados\n` +
          `3️⃣ Vincular con número\n` +
          `4️⃣ Ingresa el código\n\n` +
          `⏳ *Expira en 60 segundos*\n\n` +
          `❝ El reino te aguarda,\n` +
          `   guerrero. ❞`
        )

        // Timeout de 60 segundos
        const timeout = setTimeout(async () => {
          await sock.end()
          fs.rmSync(sessionPath, { recursive: true, force: true })
          await reply(
            `╔══════════════════════╗\n` +
            `   ⚔️ *NANATSU BOT - MD*\n` +
            `╚══════════════════════╝\n\n` +
            `⏰ *Tiempo agotado*\n\n` +
            `El código expiró sin ser usado.\n` +
            `Usa *${usedPrefix}subbot code ${numero}* para reintentar.`
          )
        }, 60000)

        sock.ev.on('connection.update', async (update) => {
          const { connection } = update
          if (connection === 'open') {
            clearTimeout(timeout)
            const id = sock.user.id.split(':')[0]
            subBots.set(id, sock)
            await reply(
              `╔══════════════════════╗\n` +
              `   ⚔️ *NANATSU BOT - MD*\n` +
              `╚══════════════════════╝\n\n` +
              `✅ *¡Sub bot conectado!*\n\n` +
              `📱 *Número:* +${id}\n` +
              `🤖 *Sesión:* ${sessionId}\n\n` +
              `❝ Un nuevo guerrero\n` +
              `   se une al reino. ❞`
            )
          }
          if (connection === 'close') {
            clearTimeout(timeout)
            const id = sock?.user?.id?.split(':')[0]
            if (id) subBots.delete(id)
          }
        })

      } catch (e) {
        fs.rmSync(sessionPath, { recursive: true, force: true })
        return reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `🔴 *Error al generar código*\n\n` +
          `\`\`\`${e.message}\`\`\``
        )
      }
      return
    }

    // ❌ Subcomando no reconocido
    return reply(
      `╔══════════════════════╗\n` +
      `   ⚔️ *NANATSU BOT - MD*\n` +
      `╚══════════════════════╝\n\n` +
      `⚠️ *Subcomando inválido*\n\n` +
      `Opciones válidas:\n` +
      `┣ *qr* — Conectar con QR\n` +
      `┣ *code* — Conectar con código\n` +
      `┣ *list* — Ver sub bots\n` +
      `┗ *kick* — Desconectar\n\n` +
      `💡 Ejemplo: *${usedPrefix}subbot qr*`
    )
  }
}