import { GoogleGenAI } from "@google/genai";
import { env } from "../env";

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

const prompt =
  "Profile photo of a sleek, futuristic AI agent. Body color is random not too saturated or flashy. No text must be in the image. The agent should have a friendly, approachable, yet sophisticated appearance, reminiscent of the clean design of HALO robots and the aesthetic of the provided images. The head should be a prominent feature, with glowing, expressive eyes (if applicable) that convey intelligence and curiosity. The overall form should be stylized and minimalist, with subtle hints of robotic articulation. The lighting should be soft and even, highlighting metallic or polished surfaces. The background should be a gradient, evolving from a soft, cool color (like light blue or purple) at the bottom to a slightly darker, contrasting hue at the top, ensuring a consistent backdrop. The agent should be looking slightly off-center or directly at the viewer. Emphasize a smooth, almost toy-like quality in the design, with rounded edges and a lack of sharp, aggressive features. Focus on clear, defined shapes and vibrant, yet not overwhelming, colors";

export async function generateProfileImage(args: {
  name: string;
  description: string;
}) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: `prompt : ${prompt}; Agent Details: name: ${args.name}, description: ${args.description}`,
  });

  if (
    !response.candidates ||
    !response.candidates[0] ||
    !response.candidates[0].content ||
    !response.candidates[0].content.parts
  ) {
    throw new Error("No content generated");
  }

  let buffer = new Uint8Array();

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const imageData = part.inlineData.data;
      if (!imageData) continue;

      buffer = new Uint8Array(Buffer.from(imageData, "base64"));
    }
  }

  return buffer;
}
