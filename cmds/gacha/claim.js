import { promises as fs } from 'fs';

const charactersFilePath = './lib/characters.json';

async function loadCharacters() {
  const data = await fs.readFile(charactersFilePath, 'utf-8');
  return JSON.parse(data);
}

function getCharacterById(id, structure) {
  return Object.values(structure).flatMap(s => s.characters).find(c => String(c.id) === String(id));
}

export default {
  command: ['claim', 'c', 'reclamar'],
  category: 'gacha',
  description: 'Reclamar un personaje del reino.',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      let chat = global.db.data.chats[m.chat];

      // ❌ Gacha desactivado
      if (chat.adminonly || !chat.gacha) {
        return m.reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `🚫 *El Gacha está desactivado*\n` +
          `en este reino.\n\n` +
          `🛡️ Un *Caballero Sagrado* puede\n` +
          `activarlo con:\n` +
          `» *${usedPrefix}gacha on*`
        );
      }

      // 🔧 Inicializar usuario si no existe
      if (!global.db.data.chats[m.chat]?.users?.[m.sender]) {
        global.db.data.chats[m.chat].users[m.sender] = {};
      }
      if (!global.db.data.chats[m.chat].users[m.sender].lastClaim) {
        global.db.data.chats[m.chat].users[m.sender].lastClaim = 0;
      }

      let user = global.db.data.chats[m.chat]?.users?.[m.sender];
      const me = user;
      const now = Date.now();
      const claimCooldown = 30 * 60 * 1000;

      // ⏳ Cooldown activo
      if (me.lastClaim && now < me.lastClaim) {
        const remaining = Math.ceil((me.lastClaim - now) / 1000);
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        let timeText = '';
        if (minutes > 0) timeText += `${minutes} minuto${minutes !== 1 ? 's' : ''} `;
        if (seconds > 0 || timeText === '') timeText += `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
        return m.reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `⏳ *Poder en recarga*\n\n` +
          `🕐 Espera *${timeText.trim()}*\n` +
          `antes de reclamar de nuevo.\n\n` +
          `❝ La paciencia es virtud\n` +
          `   de los Pecados. ❞`
        );
      }

      // ❌ Sin personaje citado
      const quotedId = m.quoted?.id;
      if (!quotedId || !chat.rolls[quotedId]) {
        return m.reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `🗡️ Debes *citar un personaje*\n` +
          `válido para reclamarlo.\n\n` +
          `💡 Usa *${usedPrefix}rw* para invocar\n` +
          `un personaje primero.`
        );
      }

      const rollData = chat.rolls[quotedId];
      const id = rollData.id;
      const charKey = rollData.charKey || (m.chat + '__' + id);

      const structure = await loadCharacters();
      const sourceData = getCharacterById(id, structure);
      if (!sourceData) {
        return m.reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `💀 *Personaje no encontrado*\n` +
          `en los registros del reino.`
        );
      }

      if (!global.db.data.characters) global.db.data.characters = {};
      if (!global.db.data.characters[charKey]) {
        global.db.data.characters[charKey] = {
          name: sourceData.name,
          value: sourceData.value || 0,
          votes: 0
        };
      }

      let character = global.db.data.characters[charKey];

      // 🔒 Personaje reservado por otro usuario
      if (character.reservedBy && character.reservedBy !== m.sender && now < character.reservedUntil) {
        const reserver = global.db.data.users[character.reservedBy];
        const reserverName = reserver?.name || character.reservedBy.split('@')[0];
        const remaining = ((character.reservedUntil - now) / 1000).toFixed(1);
        return m.reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `🛡️ *Personaje protegido*\n\n` +
          `👤 Reservado por: *${reserverName}*\n` +
          `⏱️ Tiempo restante: *${remaining}s*\n\n` +
          `❝ Respeta el poder ajeno. ❞`
        );
      }

      // 💀 Personaje expirado
      if (character.expiresAt && now > character.expiresAt && !character.user && !(character.reservedBy && now < character.reservedUntil)) {
        return m.reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `💀 *Este personaje ha expirado*\n` +
          `y regresó al vacío del reino.\n\n` +
          `🎴 Usa *${usedPrefix}rw* para invocar uno nuevo.`
        );
      }

      // 👤 Ya reclamado
      if (character.user) {
        const owner = global.db.data.users[character.user];
        const ownerName = owner?.name || `@${character.user.split('@')[0]}`;
        return m.reply(
          `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `⚔️ *Personaje ya reclamado*\n\n` +
          `🎴 *${character.name}* pertenece\n` +
          `al reino de *${ownerName}*\n\n` +
          `❝ Este Pecado ya tiene dueño. ❞`
        );
      }

      // ✅ Reclamar personaje
      character.user = m.sender;
      character.claimedAt = now;
      delete character.reservedBy;
      delete character.reservedUntil;
      global.db.data.characters[charKey] = character;

      if (!Array.isArray(me.characters)) me.characters = [];
      if (!me.characters.includes(id)) me.characters.push(id);
      global.db.data.chats[m.chat].users[m.sender].characters = me.characters;
      global.db.data.chats[m.chat].users[m.sender].lastClaim = now + claimCooldown;
      chat.rolls[quotedId].claimed = true;
      global.db.data.chats[m.chat].rolls = chat.rolls;

      const userGlobal = global.db.data.users[m.sender];
      const displayName = userGlobal?.name || m.sender.split('@')[0];
      if (!global.db.data.users[m.sender].claimMessage) global.db.data.users[m.sender].claimMessage = '';
      const custom = global.db.data.users[m.sender].claimMessage;
      const duration = ((now - character.expiresAt + 60000) / 1000).toFixed(1);

      const finalMessage = custom
        ? custom
            .replace(/€user/g, `*${displayName}*`)
            .replace(/€character/g, `*${character.name}*`)
        : `╔══════════════════════╗\n` +
          `   ⚔️ *NANATSU BOT - MD*\n` +
          `╚══════════════════════╝\n\n` +
          `🎴 *¡Personaje Reclamado!*\n\n` +
          `👤 *Pecador:* ${displayName}\n` +
          `🐉 *Personaje:* ${character.name}\n` +
          `⚡ *Tiempo:* ${duration}s\n\n` +
          `❝ Un nuevo Pecado se une\n` +
          `   al reino. ❞`;

      await client.sendMessage(m.chat, { text: finalMessage }, { quoted: m });

    } catch (e) {
      console.error('Error en claim NanatsuBot:', e);
      await m.reply(
        `╔══════════════════════╗\n` +
        `   ⚔️ *NANATSU BOT - MD*\n` +
        `╚══════════════════════╝\n\n` +
        `🔴 *Error en el reino*\n\n` +
        `\`\`\`${e.message}\`\`\`\n\n` +
        `❝ Hasta los Pecados\n` +
        `   tienen límites. ❞`
      );
    }
  },
};