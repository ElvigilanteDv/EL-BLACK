import { xpRange } from '../../lib/levelling.js'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const charset = { a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'ꜱ',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ' }
const textCyberpunk = t => t.replace(/[a-z]/gi, c => charset[c.toLowerCase()] || c)

const CATEGORIAS = {
  info: { icon: '📋', label: 'ɪɴꜰᴏ' },
  search: { icon: '🔍', label: 'ꜱᴇᴀʀᴄʜ' },
  descargas: { icon: '📥', label: 'ᴅᴇꜱᴄᴀʀɢᴀꜱ' }
}

const fetchBuffer = url => fetch(url).then(r => r.arrayBuffer()).then(b => Buffer.from(b))
const defaultThumb = await fetchBuffer('https://files.catbox.moe/ubf05z.jpeg')

const clockString = ms =>
  [3600000, 60000, 1000].map((v, i) =>
    String(Math.floor(ms / v) % (i ? 60 : 99)).padStart(2, '0')
  ).join(':')

export default {
  command: ['menu', 'help', 'menú', 'ayuda', 'comandos'],
  category: 'info',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net'
      const user = global.db.data.users[m.sender] || { level: 0, exp: 0 }
      const { min, xp } = xpRange(user.level || 0, global.multiplier || 1)

      const replace = {
        name: m.pushName || 'Usuario',
        level: user.level || 0,
        exp: (user.exp || 0) - min,
        maxexp: xp,
        totalreg: Object.keys(global.db.data.users).length,
        mode: global.opts?.self ? 'Privado' : 'Público',
        muptime: clockString(process.uptime() * 1000),
        readmore: String.fromCharCode(8206).repeat(4001)
      }

      const plugins = Object.values(global.plugins || {}).filter(p => !p.disabled)

      const sections = {}
      for (const cat of Object.keys(CATEGORIAS)) {
        sections[cat] = plugins.filter(p =>
          [].concat(p.tags || []).some(t => t?.toLowerCase() === cat.toLowerCase())
        )
      }

      let menuText = `
—͟͟͞͞ ⛩️ *WANG LING BOT* »
> 🪐 𝙉𝙤𝙢𝙗𝙧𝙚 » ${replace.name}
> ⚡ 𝙀𝙭𝙥 » ${replace.exp} / ${replace.maxexp}
> 🌐 𝙈𝙤𝙙𝙤 » ${replace.mode}
> ⏳ 𝘼𝙘𝙩𝙞𝙫𝙤 » ${replace.muptime}
> 👥 𝙐𝙨𝙪𝙖𝙧𝙞𝙤𝙨 » ${replace.totalreg}
${replace.readmore}`.trim()

      for (const [cat, { icon, label }] of Object.entries(CATEGORIAS)) {
        const cmds = sections[cat]
        if (!cmds || !cmds.length) continue

        menuText += `\n\n⧼⋆꙳•〔 ${icon} ${label} 〕⋆꙳•⧽`
        for (const p of cmds) {
          const helps = [].concat(p.help || [])
          if (!helps.length) continue
          const cmdLine = usedPrefix + helps[0]
          menuText += `\n> 𖣘 ${cmdLine}`
          if (p.desc) menuText += `\n> ✦ ${p.desc}`
        }
        menuText += `\n╰⋆꙳•❅‧*₊⋆꙳︎‧*❆₊⋆╯`
      }

      menuText += `\n\n⌬ 𝗪𝗔𝗡𝗚 𝗟𝗜𝗡𝗚 𝗠𝗘𝗡𝗨 ⚡ - Sistema ejecutado con éxito.`

      await client.sendMessage(m.chat, {
        image: defaultThumb,
        caption: menuText
      }, { quoted: m })

    } catch (e) {
      console.error('Error en menu WangLing:', e)
      await client.sendMessage(m.chat,
        { text: `⛩️ *WANG LING BOT*\n\n❌ Error al mostrar el menú\n\`\`\`${e.message}\`\`\`` },
        { quoted: m }
      )
    }
  }
}