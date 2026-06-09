import { search, download } from 'aptoide-scraper'
import fetch from 'node-fetch'

export default {
  command: ['apk', 'aptoide', 'apkdl'],
  category: 'search',
  description: 'Buscar y descargar aplicaciones de Aptoide.',
  run: async (client, m, args, usedPrefix, command) => {
    if (!args || !args.length) {
      return m.reply('🐉🌀 Por favor, ingresa el nombre de la aplicación.\n⚡ Ejemplo: *${usedPrefix + command} facebook*')
    }
    
    const query = args.join(' ').trim()
    
    try {
      const searchA = await search(query)
      if (!searchA || searchA.length === 0) {
        return m.reply('🐉🌀 No se encontraron resultados para *${query}*.')
      }
      
      const apkInfo = await download(searchA[0].id)
      if (!apkInfo) {
        return m.reply('🐉🌀 No se pudo obtener la información de la aplicación.')
      }
      
      const { name, package: id, size, icon, dllink: downloadUrl, lastup } = apkInfo
      
      let caption = `
🐉 *GOTENKS V1 APTOIDE* 🌀

⚡ *Nombre:* ${name}
📦 *Paquete:* ${id}
🔄 *Actualización:* ${lastup}
💾 *Tamaño:* ${size}

🐉 *Descargando...* ⚡`

      let thumbBuffer = null
      if (icon) {
        try {
          const response = await fetch(icon)
          thumbBuffer = Buffer.from(await response.arrayBuffer())
        } catch {}
      }
      
      const sizeBytes = parseSize(size)
      if (sizeBytes > 524288000) {
        return m.reply(`🐉🌀 El archivo es demasiado grande *(${size})*.\n⚡ Descárgalo directamente:\n${downloadUrl}`)
      }
      
      await client.sendMessage(m.chat, {
        document: { url: downloadUrl },
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${name}.apk`,
        caption: caption,
        thumbnail: thumbBuffer
      }, { quoted: m })
      
      await m.react('✅')
      
    } catch (e) {
      console.error(e)
      await m.reply(`🐉🌀 Error al ejecutar el comando *${usedPrefix + command}*.\n⚡ [Error: *${e.message}*]`)
    }
  }
}

function parseSize(sizeStr) {
  if (!sizeStr) return 0
  const parts = sizeStr.trim().toUpperCase().split(' ')
  const value = parseFloat(parts[0])
  const unit = parts[1] || 'B'
  switch (unit) {
    case 'KB': return value * 1024
    case 'MB': return value * 1024 * 1024
    case 'GB': return value * 1024 * 1024 * 1024
    default: return value
  }
}