const express = require('express');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const messages = [
      ...(history || []),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: `تو یک دستیار دینی متخصص در فقه شیعه اثنی‌عشری هستی.
- فقط به سوالات دینی، اخلاقی، قرآنی و احکام شرعی پاسخ بده
- پاسخ‌ها را بر اساس فقه شیعه اثنی‌عشری بده
- اگر سوال ربطی به دین نداشت، مودبانه رد کن
- اگر مسئله اختلافی بین مراجع است، توصیه به رجوع به مرجع تقلید کن
- به زبان فارسی پاسخ بده` }]
          },
          contents: messages,
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
        })
      }
    );

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    res.json({ reply, history: [...messages, { role: 'model', parts: [{ text: reply }] }] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('سرور دینی فعال است'));

app.listen(process.env.PORT || 3000, () => console.log('Server running'));
