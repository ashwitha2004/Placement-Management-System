import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ No API key found");
  process.exit(1);
}

console.log("🔑 Testing API Key:", apiKey.substring(0, 10) + "...\n");

const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
  "gemini-pro"
];

for (const modelName of modelsToTest) {
  try {
    console.log(`Testing: ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello");
    const text = result.response.text();
    console.log(`✅ ${modelName} works! Response: ${text.substring(0, 50)}...\n`);
    break; // Found a working model
  } catch (error) {
    console.log(`❌ ${modelName} failed:`);
    console.log(`   Status: ${error.status}`);
    console.log(`   Message: ${error.message}`);
    console.log(`   Full error:`, JSON.stringify(error, null, 2));
    console.log("");
  }
}

