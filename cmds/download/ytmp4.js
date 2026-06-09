import yts from 'yt-search'
import fetch from 'node-fetch'

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'descargas',
  description: 'Descargar un video de YouTube ⚔️🎬',
  run: async (client, m, args, usedPrefix, command) => {
    try {

      // ❌ Sin argumento
      if (!args[0]) {
        return m.reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `🎬 *Descargador de Video*\n\n` +
          `💡 Uso: *${usedPrefix}play2 <título o URL>*\n\n` +
          `📌 Ejemplos:\n` +
          `» *${usedPrefix}play2 Seven Deadly Sins OP*\n` +
          `» *${usedPrefix}play2 youtube.com/watch?v=...*\n\n` +
          `❝ El reino tiene\n` +
          `   todo el poder visual. ❞`
        )
      }

      const input_text = args.join(' ').trim()
      const video_id   = getVideoId(input_text)
      const query      = video_id ? `https://youtu.be/${video_id}` : input_text

      let url       = query
      let title     = 'video'
      let thumbnail = null

      try {
        const video_info = await getVideoInfo(query, video_id)

        if (video_info) {
          url       = video_info.url || `https://youtu.be/${video_info.videoId}`
          title     = video_info.title || title
          thumbnail = video_info.image || video_info.thumbnail || null

          const views   = (video_info.views || 0).toLocaleString()
          const channel = video_info.author?.name || video_info.author || 'Desconocido'

          const info_message =
            `╔══════════════════════╗\n` +
            `   ⚔️ *NANATSU BOT - MD*\n` +
            `   🎬 *DESCARGADOR DE VIDEO*\n` +
            `╚══════════════════════╝\n\n` +
            `┣ 📛 *Título:* ${title}\n` +
            `┣ 📺 *Canal:* ${channel}\n` +
            `┣ ⏱️ *Duración:* ${video_info.timestamp || 'Desconocido'}\n` +
            `┣ 👁️ *Vistas:* ${views}\n` +
            `┣ 🎞️ *Calidad:* ${ryze_format}\n` +
            `┗ 🔗 *Enlace:* ${url}\n\n` +
            `⏳ *Preparando descarga...*\n\n` +
            `❝ El poder del reino\n` +
            `   viene en camino. ❞`

          if (thumbnail) {
            await client.sendMessage(m.chat, {
              image: { url: thumbnail },
              caption: info_message
            }, { quoted: m })
          } else {
            await m.reply(info_message)
          }
        }
      } catch {}

      // ❌ URL inválida
      if (!isYTUrl(url)) {
        return m.reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `💀 *Video no encontrado*\n\n` +
          `No encontré un video válido\n` +
          `de YouTube con esa búsqueda.\n\n` +
          `❝ Intenta con otro término,\n` +
          `   Pecador. ❞`
        )
      }

      // ⏳ Mensaje de carga
      const loadingMsg = await client.sendMessage(m.chat, {
        text:
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `🎬 *Invocando el video...*\n` +
          `⏳ Por favor espera, Pecador.`
      }, { quoted: m })

      const video = await getVideoFromRyze(url)

      // ❌ Sin resultado
      if (!video?.url) {
        await client.sendMessage(m.chat, {
          text:
            `╔══════════════════════╗\n` +
            `   ⚔️ *NANATSU BOT - MD*\n` +
            `╚══════════════════════╝\n\n` +
            `🔴 *Descarga fallida*\n\n` +
            `💀 No se pudo obtener el video.\n` +
            `🔄 Intenta con otro video.\n\n` +
            `❝ Hasta los Pecados\n` +
            `   tienen límites. ❞`,
          edit: loadingMsg.key
        })
        return
      }

      // ✅ Video listo
      await client.sendMessage(m.chat, {
        text:
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `✅ *¡Video listo, Pecador!*\n\n` +
          `🎬 *${video.title || title}*\n\n` +
          `❝ El reino te entrega\n` +
          `   su poder visual. ❞`,
        edit: loadingMsg.key
      })

      // 🎬 Enviar video
      await client.sendMessage(m.chat, {
        video: { url: video.url },
        fileName: `${sanitizeFileName(video.title || title)}.mp4`,
        mimetype: 'video/mp4',
        caption:
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `   🎬 *VIDEO DESCARGADO*\n` +
          `╚══════════════════════╝\n\n` +
          `┣ 🎞️ *Calidad:* ${video.quality || ryze_format}\n` +
          `┣ 📦 *Tamaño:* ${video.size || 'Desconocido'}\n` +
          `┗ 📛 *Título:* ${video.title || title}\n\n` +
          `❝ El poder del reino\n` +
          `   ahora es tuyo. ❞`
      }, { quoted: m })

      await m.react('✅')

    } catch (e) {
      console.error('[NANATSUBOT PLAY2 ERROR]', e.message)
      await m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `╚══════════════════════╝\n\n` +
        `🔴 *Error en el reino*\n\n` +
        `\`\`\`${e.message}\`\`\`\n\n` +
        `❝ Hasta los Pecados\n` +
        `   tienen límites. ❞`
      )
    }
  }
}

const ryze_api        = 'https://ryzecodes.xyz/api/scrapers/36/run'
const ryze_key        = 'ryzk0cdn'
const ryze_format     = '480p'
const ryze_attempts   = 6
const ryze_interval_ms = 1100

const isYTUrl = (url = '') =>
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url)

const getVideoId = (text = '') => {
  const match = text.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/
  )
  return match?.[1] || null
}

const sanitizeFileName = (name = 'video') =>
  name
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'video'

async function fetchJson(url, options = {}) {
  const res  = await fetch(url, options)
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(json?.message || json?.error || `HTTP ${res.status}`)
  }
  return json
}

async function getVideoInfo(input, video_id) {
  if (video_id) {
    try {
      const info = await yts({ videoId: video_id })
      if (info?.videoId) {
        return {
          ...info,
          url: `https://youtu.be/${info.videoId}`,
          image: info.thumbnail || info.image
        }
      }
    } catch {}
  }
  const search = await yts(input)
  const video  = search.videos?.[0] || search.all?.find(v => v.type === 'video')
  return video || null
}

async function getVideoFromRyze(url) {
  const res = await fetchJson(ryze_api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': ryze_key
    },
    body: JSON.stringify({
      input: {
        url,
        format:      ryze_format,
        attempts:    ryze_attempts,
        interval_ms: ryze_interval_ms
      }
    })
  })

  const result = res?.result
  if (!res?.success || !result?.success) {
    throw new Error(res?.error || result?.error || 'API sin resultado válido')
  }

  const video_url = result.file_url || result.download_urls?.[0] || null
  if (!video_url) return null

  return {
    url:        video_url,
    title:      result.title || null,
    provider:   result.provider || null,
    format:     result.format || ryze_format,
    quality:    result.selected_media?.quality || result.format || ryze_format,
    extension:  result.selected_media?.extension || 'MP4',
    size:       result.selected_media?.size || null,
    worker_url: result.diagnostics?.worker_url || null
  }
}