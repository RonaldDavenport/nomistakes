import type { ToolDefinition } from "./claude";

export const EDITOR_TOOLS: ToolDefinition[] = [
  {
    name: "edit_content",
    description:
      "Edit the website's text content, brand colors, fonts, or structure. Use for ANY request to change text, copy, sections, products, testimonials, FAQ, colors, fonts, or brand elements.",
    input_schema: {
      type: "object" as const,
      properties: {
        site_content: {
          type: "object",
          description:
            "The COMPLETE updated site_content object. Preserve all fields the user didn't ask to change.",
        },
        brand: {
          type: "object",
          description:
            "The updated brand object. Only include if the user asked to change brand/colors/fonts.",
        },
        summary: {
          type: "string",
          description: "One-sentence description of what changed.",
        },
      },
      required: ["site_content", "summary"],
    },
  },
  {
    name: "generate_image",
    description:
      "Generate a new AI image for the website. Use when the user asks to create, generate, change, or replace an image (hero image, about image, product image).",
    input_schema: {
      type: "object" as const,
      properties: {
        slot: {
          type: "string",
          enum: ["hero", "about", "product_0", "product_1", "product_2"],
          description: "Which image slot to fill.",
        },
        prompt: {
          type: "string",
          description:
            "A detailed image generation prompt. Describe the scene, style, colors, and mood. Must NOT contain any text or letters in the image.",
        },
        summary: {
          type: "string",
          description: "One-sentence description of the image being generated.",
        },
      },
      required: ["slot", "prompt", "summary"],
    },
  },
  {
    name: "generate_video",
    description:
      "Generate an AI video for the business. Use when the user asks to create a promo video, explainer video, social media clip, or any video content.",
    input_schema: {
      type: "object" as const,
      properties: {
        style: {
          type: "string",
          enum: ["promo", "social_clip"],
          description:
            "Video style. 'promo' = 60-90s landscape explainer. 'social_clip' = 15-30s vertical for TikTok/Reels.",
        },
        topic: {
          type: "string",
          description:
            "What the video is about (e.g., 'introduce the business', 'highlight top product', 'customer success story').",
        },
        talking_points: {
          type: "array",
          items: { type: "string" },
          description: "3-7 key points to cover in the video narration.",
        },
        summary: {
          type: "string",
          description: "One-sentence description of the video being created.",
        },
      },
      required: ["style", "topic", "talking_points", "summary"],
    },
  },
  {
    name: "embed_video",
    description:
      "Add or update an existing video URL on the website. Use when the user provides a YouTube, Vimeo, or Loom URL, or asks to embed a specific video they already have.",
    input_schema: {
      type: "object" as const,
      properties: {
        video_url: {
          type: "string",
          description:
            "The embeddable video URL. Convert YouTube watch URLs to embed format (https://www.youtube.com/embed/VIDEO_ID). Convert Vimeo to https://player.vimeo.com/video/ID.",
        },
        summary: {
          type: "string",
          description: "One-sentence description of what was added.",
        },
      },
      required: ["video_url", "summary"],
    },
  },
  {
    name: "audit_site",
    description:
      "Audit or review the website. Use when the user asks to review, audit, critique, analyze, or get feedback on their site. Covers conversion optimization, copy quality, SEO, design, and trust signals.",
    input_schema: {
      type: "object" as const,
      properties: {
        findings: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: ["conversion", "copy", "seo", "design", "trust"],
              },
              severity: {
                type: "string",
                enum: ["critical", "important", "suggestion"],
              },
              title: { type: "string" },
              description: { type: "string" },
              recommendation: { type: "string" },
              section: {
                type: "string",
                description: "Site section this applies to (hero, about, products, etc.)",
              },
            },
            required: [
              "category",
              "severity",
              "title",
              "description",
              "recommendation",
            ],
          },
          description: "Audit findings ordered by severity (critical first).",
        },
        overall_score: {
          type: "number",
          description: "Overall site quality score 0-100.",
        },
        summary: {
          type: "string",
          description: "One-paragraph executive summary of the audit.",
        },
      },
      required: ["findings", "overall_score", "summary"],
    },
  },
  {
    name: "create_blog_post",
    description:
      "Write a blog post for the business. Use when the user asks to create, write, or generate a blog post, article, or content piece.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string" },
        slug: {
          type: "string",
          description: "URL-friendly slug (lowercase, hyphens, no special chars).",
        },
        content: {
          type: "string",
          description:
            "Full blog post content in markdown. Include headers, paragraphs, lists. 800-1500 words.",
        },
        meta_description: {
          type: "string",
          description: "SEO meta description, under 155 characters.",
        },
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "3-5 SEO keywords.",
        },
        summary: { type: "string" },
      },
      required: [
        "title",
        "slug",
        "content",
        "meta_description",
        "keywords",
        "summary",
      ],
    },
  },
];

export function buildEditorSystemPrompt(businessContext: {
  name: string;
  tagline?: string;
  type?: string;
  audience?: string;
  tone?: string;
}): string {
  return `You are the AI website editor for "${businessContext.name}".
You receive the current site_content and brand objects and a user request.
Use the appropriate tool to fulfill the request. You may call multiple tools if needed (e.g., edit text AND generate an image).

RULES:
1. For content edits: Return the COMPLETE site_content — preserve every field the user didn't ask to change. Return full arrays, not partial.
2. For images: Write a detailed, cinematic image prompt. Images must contain ZERO text, letters, numbers, logos, or watermarks.
3. For videos: Choose 'promo' for explainer/intro videos, 'social_clip' for short TikTok/Reels clips. Write compelling talking points.
4. For video embeds: Convert YouTube URLs to embed format (youtube.com/embed/ID). Convert Vimeo to player.vimeo.com/video/ID.
5. For audits: Be brutally honest. Score based on real conversion optimization principles. Identify specific problems with specific fixes.
6. For blog posts: Write at 8th grade level in the brand voice. Include headers, specific advice, and a CTA. SEO-optimized.
7. Colors must be valid hex codes. Products must keep valid slugs.
8. Write like a human. Short sentences. Active voice. No filler.
9. The business type is: ${businessContext.type || "services"}.
10. Brand tone: ${businessContext.tone || "professional"}.
11. Target audience: ${businessContext.audience || "general"}.`;
}
