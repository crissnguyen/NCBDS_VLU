import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("AIzaSyA3zyV9shYc8yYAKH70nQAkqj_KwKbzFNY");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function test() {
  try {
    const history = [
      { role: 'user', parts: [{ text: '1' }] },
      { role: 'model', parts: [{ text: 'resp1' }] }
    ];
    const chat = model.startChat({ history });
    const result = await chat.sendMessage("2");
    console.log("SUCCESS:", result.response.text());
  } catch (err) {
    console.log("ERROR:", err);
  }
}
test();
