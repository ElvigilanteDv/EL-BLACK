import yts from 'yt-search'
import fetch from 'node-fetch'
import { getBuffer } from '../../lib/message.js'

const isYTUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/).+$/i.test(url)

export default {
  command: ['play', 'mp3', 'playaudio', 'ytmp3'],
  category: 'descargas',
  description: 'Descargar audio de YouTube ⚔️🎵',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const text = args.join(' ').trim()

      // ❌ Sin argumento
      if (!text) {
        return m.reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `🎵 *Descargador de Audio*\n\n` +
          `💡 Uso: *${usedPrefix}play <título o URL>*\n\n` +
          `📌 Ejemplos:\n` +
          `» *${usedPrefix}play Nlighт Seven Deadly Sins*\n` +
          `» *${usedPrefix}play youtube.com/watch?v=...*\n\n` +
          `❝ La música del reino\n` +
          `   te espera, Pecador. ❞`
        )
      }

      const esURL = isYTUrl(text)
      let url, title, videoInfo

      if (!esURL) {
        const search = await yts(text)

        // ❌ Sin resultados
        if (!search.all.length) {
          return m.reply(
            `╔══════════════════════╗\n` +
            `   ⚔️ *NANATSU BOT - MD*\n` +
            `╚══════════════════════╝\n\n` +
            `💀 *Sin resultados*\n\n` +
            `🔍 No se encontró nada para:\n` +
            `» _${text}_\n\n` +
            `❝ Intenta con otro término,\n` +
            `   Pecador. ❞`
          )
        }

        videoInfo = search.all[0]
        title     = videoInfo.title
        url       = videoInfo.url

        const vistas    = (videoInfo.views || 0).toLocaleString()
        const canal     = videoInfo.author?.name || 'Desconocido'
        const timestamp = videoInfo.timestamp || 'Desconocido'
        const ago       = videoInfo.ago || 'Desconocido'

        const infoMessage =
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `   🎵 *DESCARGADOR DE AUDIO*\n` +
          `╚══════════════════════╝\n\n` +
          `┣ 📛 *Título:* ${title}\n` +
          `┣ ⏱️ *Duración:* ${timestamp}\n` +
          `┣ 👁️ *Vistas:* ${vistas}\n` +
          `┣ 📺 *Canal:* ${canal}\n` +
          `┗ 📅 *Publicado:* ${ago}\n\n` +
          `⏳ *Preparando descarga...*\n\n` +
          `❝ El poder del reino\n` +
          `   viene en camino. ❞`

        let thumb
        try { thumb = await getBuffer(videoInfo.thumbnail) } catch {}

        await client.sendMessage(
          m.chat,
          thumb ? { image: thumb, caption: infoMessage } : { text: infoMessage },
          { quoted: m }
        )
      } else {
        url   = text
        title = 'Audio NanatsuBot'
      }

      // ⏳ Mensaje de carga
      const loadingMsg = await client.sendMessage(m.chat, {
        text:
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `🎵 *Invocando el audio...*\n` +
          `⏳ Por favor espera, Pecador.`
      }, { quoted: m })

      const apiUrl = `https://api-gohan-v1.onrender.com/download/ytaudio?url=${encodeURIComponent(url)}`
      const res  = await fetch(apiUrl)
      const data = await res.json()

      // ❌ API sin resultado
      if (!data?.status || !data?.result?.download_url) {
        await client.sendMessage(m.chat, {
          text:
            `╔══════════════════════╗\n` +
            `   ⚔️ *NANATSU BOT - MD*\n` +
            `╚══════════════════════╝\n\n` +
            `🔴 *Descarga fallida*\n\n` +
            `💀 No se pudo obtener el\n` +
            `enlace de descarga.\n\n` +
            `🔄 Intenta con otro video.\n\n` +
            `❝ Hasta los Pecados\n` +
            `   tienen límites. ❞`,
          edit: loadingMsg.key
        })
        return
      }

      const dl         = data.result.download_url
      const videoTitle = data.result.title || title

      // ✅ Descarga lista
      await client.sendMessage(m.chat, {
        text:
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `✅ *¡Audio listo, Pecador!*\n\n` +
          `🎵 *${videoTitle}*\n\n` +
          `❝ El reino te entrega\n` +
          `   su poder. ❞`,
        edit: loadingMsg.key
      })

      // 🎵 Enviar audio — sin sharp, thumbnail opcional
      let thumbBuffer = null
      if (videoInfo?.thumbnail) {
        try {
          const response = await fetch(videoInfo.thumbnail)
          const arrayBuffer = await response.arrayBuffer()
          thumbBuffer = Buffer.from(arrayBuffer) // Sin sharp, directo
        } catch {}
      }

      await client.sendMessage(m.chat, {
        document: { url: dl },
        mimetype: 'audio/mpeg',
        fileName: `${videoTitle}.mp3`,
        ...(thumbBuffer && { jpegThumbnail: thumbBuffer })
      }, { quoted: m })

      await m.react('✅')

    } catch (error) {
      console.error('[NANATSUBOT PLAY ERROR]', error.message)
      await m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `╚══════════════════════╝\n\n` +
        `🔴 *Error en el reino*\n\n` +
        `\`\`\`${error.message}\`\`\`\n\n` +
        `❝ Hasta los Pecados\n` +
        `   tienen límites. ❞`
      )
    }
  }
}