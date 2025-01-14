require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

async function createSummary(req, res, next) {
  const prompt = `
    ${req.body.content}

    Buatlah satu paragraf singkat rangkuman dari teks diatas
    `;
  const result = await model.generateContent(prompt);
  req.body.summary = await result.response.candidates[0].content.parts[0].text;
  console.log("mysumm");
  console.log(req.params);
  next();
}

module.exports = createSummary;
