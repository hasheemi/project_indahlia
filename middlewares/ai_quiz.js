require("dotenv").config();
const bucket = require("../helpers/bucket");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});
function parseJSONString(inputString) {
  try {
    const cleanedString = inputString
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsedData = JSON.parse(cleanedString);
    return parsedData;
  } catch (error) {
    console.error("Error parsing JSON string:", error);
    return null;
  }
}
async function createQuiz(req, res, next) {
  const prompt = `
    ${req.body.content}

    buat kode quiz berbahasa indonesia dari teks diatas dengan template seperti ini 
[
  {
    "question": "What is the capital of France?",
    "options": ["Paris", "Berlin", "Madrid", "Rome"],
    "answer": "Paris"
  },
  {
    "question": "What is 2 + 2?",
    "options": ["3", "4", "5", "6"],
    "answer": "4"
  },
  {
    "question": "What is the largest planet in our solar system?",
    "options": ["Earth", "Mars", "Jupiter", "Saturn"],
    "answer": "Jupiter"
  }
]
    `;
  const result = await model.generateContent(prompt);
  const json = await parseJSONString(
    result.response.candidates[0].content.parts[0].text
  );
  let name = `${req.body.slug}-${req.body.nom}-${req.body.date}.json`;
  console.log(name);
  bucket.createObject(name, Buffer.from(JSON.stringify(json)), (err) => {
    if (err) {
      res.render(`${req.body.render}.ejs`, {
        err: "Failed to upload one or more files",
      });
      console.log("yu");
    } else {
      req.body.quiz = `/cdn/${name}`;
      next();
    }
  });
}

module.exports = createQuiz;
