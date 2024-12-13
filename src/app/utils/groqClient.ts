import Groq from "groq-sdk";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function getGroqResponse(message: string) {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are an academic expert, you always cite your sources and base your responses only on the context that you have been provided.",
    },
    { role: "user", content: message },
  ];
  console.log("Starting groq api request:", messages);
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages,
  });
  console.log("Received groq api response:", response);

  return response.choices[0].message.content;
}