const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion} = (await import("@whiskeysockets/baileys"));
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util'
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""

// ⚔️ Mensaje QR
let rtx = `
╔══════════════════════╗
   ⚔️ *NANATSU BOT - MD*
   🔗 *VINCULACIÓN POR QR*
╚══════════════════════╝

📋 *Pasos para unirte al reino:*

1️⃣ Abre *WhatsApp* en tu teléfono
2️⃣ Pulsa ⋮ *Más opciones*
3️⃣ Toca *Dispositivos vinculados*
4️⃣ Presiona *Vincular un dispositivo*
5️⃣ Escanea el código QR

❝ Un nuevo guerrero
   se une al reino. ❞
`.trim()

// 🔑 Mensaje Código
let rtx2 = `
╔══════════════════════╗
   ⚔️ *NANATSU BOT - MD*
   🔑 *VINCULACIÓN POR CÓDIGO*
╚══════════════════════╝

📋 *Pasos para unirte al reino:*

1️⃣ Abre *WhatsApp* en tu teléfono
2️⃣ Pulsa ⋮ *Más opciones*
3️⃣ Toca *Dispositivos vinculados*
4️⃣ Presiona *Vincular un dispositivo*
5️⃣ Selecciona *"Con número"*
6️⃣ Ingresa el código mostrado

❝ El reino te aguarda,
   guerrero. ❞
`.trim()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const yukiJBOptions = {}
if (global.conns instanceof Array) console.log()
else global.conns = []

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {

  let time = global.db.data.users[m.sender].Subs + 120000

  const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
  const subBotsCount = subBots.length

  // ❌ Sin espacios disponibles
  if (subBotsCount === 30) {
    return m.reply(
      `╔══════════════════════╗\n` +
      `   ⚔️ *NANATSU BOT - MD*\n` +
      `╚══════════════════════╝\n\n` +
      `🚫 *Reino lleno*\n\n` +
      `No hay espacios disponibles\n` +
      `para nuevos Sub-Bots.\n\n` +
      `❝ El reino tiene\n` +
      `   sus límites. ❞`
    )
  }

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let id = `${who.split`@`[0]}`
  let pathYukiJadiBot = path.join(`./${jadi}/`, id)

  if (!fs.existsSync(pathYukiJadiBot)) {
    fs.mkdirSync(pathYukiJadiBot, { recursive: true })
  }

  yukiJBOptions.pathYukiJadiBot = pathYukiJadiBot
  yukiJBOptions.m = m
  yukiJBOptions.conn = conn
  yukiJBOptions.args = args
  yukiJBOptions.usedPrefix = usedPrefix
  yukiJBOptions.command = command
  yukiJBOptions.fromCommand = true
  yukiJadiBot(yukiJBOptions)
  global.db.data.users[m.sender].Subs = new Date * 1
}

handler.help    = ['qr', 'code']
handler.tags    = ['jadibot']
handler.command = ['qr', 'code']
handler.desc    = 'Convertirse en Sub-Bot del reino ⚔️'
export default handler

export async function yukiJadiBot(options) {
  let { pathYukiJadiBot, m, conn, args, usedPrefix, command } = options

  if (command === 'code') {
    command = 'qr'
    args.unshift('code')
  }

  const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
  let txtCode, codeBot, txtQR

  if (mcode) {
    args[0] = args[0].replace(/^--code$|^code$/, "").trim()
    if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
    if (args[0] == "") args[0] = undefined
  }

  const pathCreds = path.join(pathYukiJadiBot, "creds.json")
  if (!fs.existsSync(pathYukiJadiBot)) {
    fs.mkdirSync(pathYukiJadiBot, { recursive: true })
  }

  try {
    args[0] && args[0] != undefined
      ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'))
      : ""
  } catch {
    conn.reply(m.chat,
      `╔══════════════════════╗\n` +
      `   ⚔️ *NANATSU BOT - MD*\n` +
      `╚══════════════════════╝\n\n` +
      `⚠️ *Comando incorrecto*\n\n` +
      `💡 Uso correcto:\n` +
      `» *${usedPrefix + command} code*\n\n` +
      `❝ Sin orden no hay\n` +
      `   reino. ❞`,
      m
    )
    return
  }

  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
  exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
    const drmer = Buffer.from(drm1 + drm2, `base64`)

    let { version, isLatest } = await fetchLatestBaileysVersion()
    const msgRetry = (MessageRetryMap) => { }
    const msgRetryCache = new NodeCache()
    const { state, saveState, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot)

    const connectionOptions = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      msgRetry,
      msgRetryCache,
      browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['NanatsuBot-MD', 'Chrome', '2.0.0'],
      version: version,
      generateHighQualityLinkPreview: true
    }

    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    let isInit = true

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update
      if (isNewLogin) sock.isInit = false

      // 📷 Enviar QR
      if (qr && !mcode) {
        if (m?.chat) {
          txtQR = await conn.sendMessage(m.chat, {
            image: await qrcode.toBuffer(qr, { scale: 8 }),
            caption: rtx.trim()
          }, { quoted: m })
        } else {
          return
        }
        if (txtQR && txtQR.key) {
          setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key }) }, 30000)
        }
        return
      }

      // 🔑 Enviar Código
      if (qr && mcode) {
        let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
        secret = secret.match(/.{1,4}/g)?.join("")

        txtCode = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m })
        codeBot = await conn.sendMessage(m.chat, {
          text:
            `╔══════════════════════╗\n` +
            `   ⚔️ *NANATSU BOT - MD*\n` +
            `   🔑 *CÓDIGO DE ACCESO*\n` +
            `╚══════════════════════╝\n\n` +
            `🔑 *Tu código:*\n` +
            `┗ *${secret}*\n\n` +
            `⏳ *Expira en 30 segundos*\n\n` +
            `❝ Úsalo antes de que\n` +
            `   el poder se desvanezca. ❞`
        }, { quoted: m })

        console.log(secret)
      }

      if (txtCode && txtCode.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key }) }, 30000)
      }
      if (codeBot && codeBot.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key }) }, 30000)
      }

      const endSesion = async (loaded) => {
        if (!loaded) {
          try { sock.ws.close() } catch { }
          sock.ev.removeAllListeners()
          let i = global.conns.indexOf(sock)
          if (i < 0) return
          delete global.conns[i]
          global.conns.splice(i, 1)
        }
      }

      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

      // 🔴 Conexión cerrada — logs temáticos
      if (connection === 'close') {
        const numero = path.basename(pathYukiJadiBot)
        const logBox = (msg) => chalk.bold.redBright(
          `\n╔══════════════════════════════════╗\n` +
          `  ⚔️  NANATSU BOT - MD | SUB-BOT\n` +
          `╚══════════════════════════════════╝\n` +
          `  📱 Número: +${numero}\n` +
          `  ❌ ${msg}\n` +
          `══════════════════════════════════`
        )

        if (reason === 428) {
          console.log(logBox('Conexión cerrada inesperadamente. Reconectando...'))
          await creloadHandler(true).catch(console.error)
        }
        if (reason === 408) {
          console.log(logBox(`Conexión perdida o expirada. Razón: ${reason}. Reconectando...`))
          await creloadHandler(true).catch(console.error)
        }
        if (reason === 440) {
          console.log(logBox('Sesión reemplazada por otra activa.'))
        }
        if (reason == 405 || reason == 401) {
          console.log(logBox('Credenciales inválidas o dispositivo desconectado.'))
          fs.rmdirSync(pathYukiJadiBot, { recursive: true })
        }
        if (reason === 500) {
          console.log(logBox('Conexión perdida. Borrando datos...'))
          return creloadHandler(true).catch(console.error)
        }
        if (reason === 515) {
          console.log(logBox('Reinicio automático de sesión.'))
          await creloadHandler(true).catch(console.error)
        }
        if (reason === 403) {
          console.log(logBox('Sesión cerrada o cuenta en soporte.'))
          fs.rmdirSync(pathYukiJadiBot, { recursive: true })
        }
      }

      if (global.db.data == null) loadDatabase()

      // ✅ Conexión abierta
      if (connection == `open`) {
        if (!global.db.data?.users) loadDatabase()
        let userName = sock.authState.creds.me.name || 'Guerrero'
        let userJid  = sock.authState.creds.me.jid  || `${path.basename(pathYukiJadiBot)}@s.whatsapp.net`

        console.log(chalk.bold.greenBright(
          `\n╔══════════════════════════════════╗\n` +
          `  ⚔️  NANATSU BOT - MD | SUB-BOT\n` +
          `╚══════════════════════════════════╝\n` +
          `  🟢 Guerrero: ${userName}\n` +
          `  📱 Número: +${path.basename(pathYukiJadiBot)}\n` +
          `  ✅ Conectado al reino exitosamente\n` +
          `══════════════════════════════════`
        ))

        sock.isInit = true
        global.conns.push(sock)
        await joinChannels(sock)

        // ✅ Notificar en WhatsApp
        await conn.sendMessage(m.chat, {
          text:
            `╔══════════════════════╗\n` +
            `   ⚔️ *NANATSU BOT - MD*\n` +
            `╚══════════════════════╝\n\n` +
            `✅ *¡Sub-Bot conectado!*\n\n` +
            `👤 *Guerrero:* ${userName}\n` +
            `📱 *Número:* +${path.basename(pathYukiJadiBot)}\n` +
            `🤖 *Sub-Bots activos:* ${global.conns.length}\n\n` +
            `❝ Un nuevo guerrero\n` +
            `   se une al reino. ❞`
        }, { quoted: m })
      }
    }

    setInterval(async () => {
      if (!sock.user) {
        try { sock.ws.close() } catch (e) { }
        sock.ev.removeAllListeners()
        let i = global.conns.indexOf(sock)
        if (i < 0) return
        delete global.conns[i]
        global.conns.splice(i, 1)
      }
    }, 60000)

    let handler = await import('../handler.js')
    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Object.keys(Handler || {}).length) handler = Handler
      } catch (e) {
        console.error('Error en handler:', e)
      }

      if (restatConn) {
        const oldChats = sock.chats
        try { sock.ws.close() } catch { }
        sock.ev.removeAllListeners()
        sock = makeWASocket(connectionOptions, { chats: oldChats })
        isInit = true
      }

      if (!isInit) {
        sock.ev.off("messages.upsert",    sock.handler)
        sock.ev.off("connection.update",  sock.connectionUpdate)
        sock.ev.off('creds.update',       sock.credsUpdate)
      }

      sock.handler           = handler.handler.bind(sock)
      sock.connectionUpdate  = connectionUpdate.bind(sock)
      sock.credsUpdate       = saveCreds.bind(sock, true)
      sock.ev.on("messages.upsert",   sock.handler)
      sock.ev.on("connection.update", sock.connectionUpdate)
      sock.ev.on("creds.update",      sock.credsUpdate)
      isInit = false
      return true
    }

    creloadHandler(false)
  })
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function msToTime(duration) {
  var seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours   = Math.floor((duration / (1000 * 60 * 60)) % 24)
  hours   = (hours   < 10) ? '0' + hours   : hours
  minutes = (minutes < 10) ? '0' + minutes : minutes
  seconds = (seconds < 10) ? '0' + seconds : seconds
  return `${minutes}m y ${seconds}s`
}

async function joinChannels(conn) {
  for (const channelId of Object.values(global.ch)) {
    await conn.newsletterFollow(channelId).catch(() => {})
  }
}