require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

function generateRandomPrompt(description) {
  const promptTypes = [
    (desc) =>
      `Berdasarkan deskripsi berikut: "${desc}", berikan saran kegiatan yang dapat dilakukan di tempat wisata ini. beri satu pargraf singkat`,
    (desc) =>
      `Berdasarkan deskripsi berikut: "${desc}", kapan hari atau waktu terbaik untuk mengunjungi tempat wisata ini? beri satu pargraf singkat`,
    (desc) =>
      `Berdasarkan deskripsi berikut: "${desc}", berikan anjuran keamanan yang perlu diperhatikan saat berkunjung. beri satu pargraf singkat`,
  ];

  const randomIndex = Math.floor(Math.random() * promptTypes.length);
  return promptTypes[randomIndex](description);
}

async function createRecomendation(req, res, next) {
  const prompt = generateRandomPrompt(req.body.desc);
  const result = await model.generateContent(prompt);
  req.body.recom = await result.response.candidates[0].content.parts[0].text;
  next();
}

module.exports = createRecomendation;
