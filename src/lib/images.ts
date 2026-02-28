import OpenAI from "openai";
import { createServerClient } from "./supabase";

let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  return _openai;
}

interface ImageSet {
  hero: string;
  about: string;
  products: string[];
}

interface ProductInfo {
  name: string;
  desc: string;
}

/**
 * Generate 5 business images (hero, about, 3 products) using OpenAI gpt-image-1,
 * upload to Supabase storage, and return public URLs.
 */
export async function generateBusinessImages(
  businessId: string,
  businessName: string,
  type: string,
  tagline: string,
  tone: string,
  products: ProductInfo[]
): Promise<ImageSet> {
  const isServices = type === "services";
  const styleGuide = `Photorealistic, cinematic lighting, ${tone} aesthetic. High-end commercial photography style. CRITICAL: The image must contain absolutely ZERO text, ZERO letters, ZERO numbers, ZERO words, ZERO logos, ZERO watermarks, ZERO labels, ZERO captions anywhere in the image. All surfaces, screens, and signs must be blank or show abstract patterns only.`;

  // Build prompts for each image
  const heroPrompt = isServices
    ? `Professional lifestyle photograph for a premium ${type} business. ${tagline}. Show a confident professional in a modern workspace or meeting setting. ${styleGuide}`
    : `Stunning product photography for a digital product brand. ${tagline}. Show a sleek laptop or tablet displaying an abstract colorful interface with no readable text, in a modern minimalist setting with soft lighting. ${styleGuide}`;

  const aboutPrompt = isServices
    ? `Behind-the-scenes photograph of a creative professional workspace. Clean desk with a laptop showing abstract visuals, notebook, coffee, and natural light streaming in. Warm, inviting atmosphere that conveys expertise and approachability. ${styleGuide}`
    : `Modern creative workspace flat-lay photograph. Laptop showing abstract colorful gradients, design tools, notebook, and coffee on a clean desk. Overhead shot with beautiful natural lighting. Conveys creativity and digital craftsmanship. ${styleGuide}`;

  const productPrompts = products.slice(0, 3).map((p) =>
    isServices
      ? `Professional photograph representing a premium consulting service. ${p.desc}. Show a business setting that conveys transformation and results, such as a strategy session or client meeting. ${styleGuide}`
      : `Premium product mockup photograph for a digital product. ${p.desc}. Show a modern device displaying abstract colorful UI with no readable text, in a clean aspirational setting. ${styleGuide}`
  );

  // Generate images sequentially (to stay within rate limits) with retry
  const allPrompts = [
    { key: "hero", prompt: heroPrompt },
    { key: "about", prompt: aboutPrompt },
    ...productPrompts.map((prompt, i) => ({ key: `product_${i}`, prompt })),
  ];

  const db = createServerClient();
  const results: { key: string; url: string }[] = [];

  for (const { key, prompt } of allPrompts) {
    let retries = 3;
    let result = { key, url: "" };

    while (retries > 0) {
      try {
        const response = await getOpenAI().images.generate({
          model: "gpt-image-1",
          prompt,
          n: 1,
          size: "1536x1024",
          quality: "low",
        });

        const b64 = response.data?.[0]?.b64_json;
        if (!b64) throw new Error("No image data returned");

        // Upload to Supabase storage
        const buffer = Buffer.from(b64, "base64");
        const path = `${businessId}/${key}.webp`;

        const { error: uploadError } = await db.storage
          .from("business-images")
          .upload(path, buffer, {
            contentType: "image/webp",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = db.storage
          .from("business-images")
          .getPublicUrl(path);

        result = { key, url: urlData.publicUrl };
        break; // Success, exit retry loop
      } catch (err: unknown) {
        const status = (err as { status?: number }).status;
        if (status === 429 && retries > 1) {
          console.log(`[images] Rate limited on ${key}, waiting 15s...`);
          await new Promise((r) => setTimeout(r, 15000));
          retries--;
          continue;
        }
        console.error(`[images] Failed to generate ${key}:`, err);
        break;
      }
    }
    results.push(result);
  }

  // Assemble the result
  const urlMap: Record<string, string> = {};
  for (const r of results) {
    urlMap[r.key] = r.url;
  }

  return {
    hero: urlMap["hero"] || "",
    about: urlMap["about"] || "",
    products: [
      urlMap["product_0"] || "",
      urlMap["product_1"] || "",
      urlMap["product_2"] || "",
    ].filter((u) => u !== ""),
  };
}
