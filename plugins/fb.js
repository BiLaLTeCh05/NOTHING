const { cmd } = require('../command');
const axios = require('axios');

const api = "https://facebook-downloader.chamodshadow125.workers.dev/api/fb?url=https://www.facebook.com/share/v/1Kzm9VAG6g/";

cmd({
    pattern: "fb",
    alias: ["fbvideo", "fbv", "fbvi", "fbdownload", "fbdl", "fbvid", "fbvide", "fbvideos"],
    react: "🥺",
    desc: "Download FB video HD/SD",
    category: "download",
    use: ".fb <link>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    if (!q) return reply("*AP KO KOI FACEBOOK VIDEO DOWNLOAD KARNI HAI 🤔 TO AP US FACEBOOK VIDEO KA LINK COPY KAR LO 😊*\n*AUR PHIR ESE LIKHO ☺️*\n\nFB ❮FACEBOOK VIDEO LINK❯*\n\n*JAB AP ESE LIKHO GE 😃 TO APKI FACEBOOK VIDEO DOWNLOAD KAR KE 😇 YAHA PER BHEJ DE JAYE GE 🥰♥️*");

    try {
        const fb = await axios.get(`${api}?url=${encodeURIComponent(q)}`);
        const data = fb.data;

        if (!data?.download?.videos || data.download.videos.length === 0) {
            return reply("*Video nahi mila 😔*");
        }

        const videos = data.download.videos;

        // Caption + HD/SD options
        let caption = "*APKI FACWBOOK VIDEO MIL GAYI HAI 😃PEHLE IS MSG KO MENTION KARO 🥺 AUR PHIR AGAR NUMBER ❮1❯ LIKHO GE TO HD VIDEO AYE GE ☺️ AGAR NUMBER ❮2❯ LIKHO GE TO VIDEO LOW QUALITY ME AYE GE 🥰 IS MSG KO MENTION KAR KE FIR NUMBER LIKHO 🥺*\n\n";
        videos.forEach((v, i) => {
            caption += `\n❮${i+1}❯ ${v.quality}`;
        });
        caption += "\n\n*👑 BY :❯ BILAL-MD 👑*";

        const sentMsg = await conn.sendMessage(from, {
            image: { url: data.metadata.thumbnail },
            caption
        }, { quoted: m });

        const messageID = sentMsg.key.id;

        // Listen for number reply
        conn.ev.on("messages.upsert", async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg?.message) return;

            const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
            const senderID = receivedMsg.key.remoteJid;
            const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (!isReplyToBot) return;
            await conn.sendMessage(senderID, { react: { text: '☺️', key: receivedMsg.key } });

            const choice = parseInt(receivedText.trim());
            if (!choice || choice < 1 || choice > videos.length) return;

            const video = videos[choice - 1];

            switch (choice) {
                case 1: // simple video
                    await conn.sendMessage(senderID, {
                        video: { url: video.link },
                        mimetype: "video/mp4"
                    }, { quoted: receivedMsg });
                    break;

                case 2: // file video
                    await conn.sendMessage(senderID, {
                        document: { url: video.link },
                        mimetype: "video/mp4",
                        fileName: `${data.metadata.title}.mp4`
                    }, { quoted: receivedMsg });
                    break;
            }
        });

    } catch (err) {
        console.error("*FB VIDEO DOWNLOAD ERROR*", err);
        reply("*FACEBOOK VIDEO NAHI MILI 🥺 DUBARA KOSHISH KATO ☺️*");
    }
});
