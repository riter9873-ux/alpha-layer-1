export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ success: false, error: "Missing BOT_TOKEN or CHAT_ID" });
  }

  try {
    const { image, camera } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: "No image data" });
    }

    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    formData.append("photo", new Blob([buffer], { type: 'image/png' }), `${camera || 'photo'}.png`);

    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      body: formData,
    });

    const result = await tgRes.json();

    if (!result.ok) {
      console.error("Telegram error:", result);
      return res.status(500).json({ success: false, error: result.description || "Telegram API error" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
