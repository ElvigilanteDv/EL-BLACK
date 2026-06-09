import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec) // 👈 Convierte exec a Promise
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const COMMANDS_DIR = path.join(__dirname, '..') // Ajusta si es necesario

async function reloadCommands(dir = COMMANDS_DIR) {
  const commandsMap = new Map()

  async function readCommands(folder) {
    const files = fs.readdirSync(folder)
    for (const file of files) {
      const fullPath = path.join(folder, file)
      if (fs.lstatSync(fullPath).isDirectory()) {
        await readCommands(fullPath)
      } else if (file.endsWith('.js')) {
        try {
          const { default: cmd } = await import(`${fullPath}?update=${Date.now()}`)
          if (cmd?.command) {
            cmd.command.forEach((c) => commandsMap.set(c.toLowerCase(), cmd))
          }
        } catch (err) {
          console.error(`❌ Error recargando ${file}:`, err.message)
        }
      }
    }
  }

  await readCommands(dir)
  global.comandos = commandsMap
  return commandsMap.size
}

export default {
  command: ['fix', 'update'],
  isOwner: true,
  run: async (client, m) => {
    const jid = m.key.remoteJid
    const reply = (text) => client.sendMessage(jid, { text }, { quoted: m })

    await reply('⏳ *Ejecutando actualización...*')

    try {
      // 1. Git pull con await real
      const { stdout, stderr } = await execAsync('git pull')

      // 2. Recargar comandos y obtener total
      const total = await reloadCommands()

      // 3. Respuesta según resultado
      if (stdout.includes('Already up to date.')) {
        await reply(
          `╔══════════════════════╗\n` +
          `   ✦ *NANATSU BOT - MD* ✦\n` +
          `╚══════════════════════╝\n\n` +
          `⚔️ *Sistema de Actualización*\n\n` +
          `🟢 *Estado:* Ya estaba actualizado\n` +
          `📦 *Comandos cargados:* ${total}\n\n` +
          `❝ Sin cambios, el poder permanece. ❞`
        )
      } else {
        await reply(
          `╔══════════════════════╗\n` +
          `   ✦ *NANATSU BOT - MD* ✦\n` +
          `╚══════════════════════╝\n\n` +
          `⚔️ *Sistema de Actualización*\n\n` +
          `✅ *Estado:* Actualización completada\n` +
          `📦 *Comandos recargados:* ${total}\n\n` +
          `📋 *Cambios:*\n${stdout.trim()}\n\n` +
          `❝ El poder ha evolucionado. ❞`
        )
      }

    } catch (err) {
      // Error en git pull o en recarga
      await reply(
        `╔══════════════════════╗\n` +
        `   ✦ *NANATSU BOT - MD* ✦\n` +
        `╚══════════════════════╝\n\n` +
        `🔴 *Error en actualización*\n\n` +
        `\`\`\`${err.message}\`\`\`\n\n` +
        `❝ Hasta los Pecados tienen límites. ❞`
      )
    }
  }
}