import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { Question, QuestionType, QuizGenerationParams, Blueprint } from "../types";

// Helper to ensure API Key is selected (for AI Studio environments)
const ensureApiKey = async () => {
  const win = window as any;
  if (win.aistudio) {
    try {
      const hasKey = await win.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await win.aistudio.openSelectKey();
      }
    } catch (e) {
      console.warn("AI Studio key selection failed", e);
    }
  }
};

// Initialize helper - Create client ONLY when needed to ensure fresh key
const createAIClient = () => {
  // If process.env.API_KEY is missing, it might be handled by internal platform proxy or allow empty for prompt
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

// --- SYSTEM HEALTH CHECK ---
export const validateGeminiConnection = async (): Promise<{success: boolean, message: string, latency: number, keyCount: number}> => {
  const startTime = Date.now();
  
  // Try to ensure key first if possible (though this runs in background)
  if (typeof window !== 'undefined' && (window as any).aistudio) {
      // Don't force open dialog here, just check
  } else if (!process.env.API_KEY) {
    return { success: false, message: "API_KEY not found in environment variables", latency: 0, keyCount: 0 };
  }

  try {
    const ai = createAIClient();
    
    // Perform a minimal token generation task using the fastest model
    await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: "Ping" }] },
    });

    const duration = Date.now() - startTime;
    return { success: true, message: "Active & Responding", latency: duration, keyCount: 1 };
  } catch (error: any) {
    return { success: false, message: error.message || "Connection failed", latency: 0, keyCount: 1 };
  }
};

// --- PROMPT ENGINEERING HELPERS ---

const getSubjectInstruction = (subject: string, category: string): string => {
  const base = `Subject: ${subject} (${category}).`;
  
  if (['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Matematika Peminatan', 'Matematika Terapan', 'IPAS'].includes(subject)) {
    return `${base} CRITICAL LATEX RULES: 
    1. ALWAYS use INLINE format with single '$' delimiters (e.g. "Calculate $E=mc^2$"). 
    2. NEVER use block delimiters like '$$', '\\[' or '\\begin{equation}'. 
    3. NEVER insert line breaks (\\n) before or after equations; they must flow naturally within the sentence.
    4. Use '\\text{...}' for text inside equations.
    5. Simplify fractions where possible to keep vertical height small.`;
  }
  if (subject === 'Bahasa Arab') {
    return `${base} CRITICAL: Content must be in Arabic script (Amiri font compatible). Use correct Tashkeel/Harakat where necessary for clarity. Ensure Right-to-Left (RTL) context logic.`;
  }
  if (subject === 'Bahasa Jepang') {
    return `${base} CRITICAL: Use appropriate Kanji, Hiragana, and Katakana. Context: Noto Sans JP.`;
  }
  if (subject === 'Bahasa Korea') {
    return `${base} CRITICAL: Use Hangul with correct spacing and honorifics. Context: Noto Serif KR.`;
  }
  if (subject === 'Bahasa Mandarin') {
    return `${base} CRITICAL: Use Traditional Characters (繁體中文). Context: Noto Sans TC.`;
  }
  if (subject === 'Pendidikan Agama Islam dan Budi Pekerti') {
     return `${base} Include relevant Dalil (Quran/Hadith) in explanations where applicable.`;
  }
  
  return base;
};

// Helper to clean LaTeX and force inline
const sanitizeLatex = (text: string): string => {
  if (!text) return "";
  
  let clean = text;
  
  // 1. Replace Block delimiters $$...$$ with $...$
  clean = clean.replace(/\$\$([\s\S]*?)\$\$/g, '$$$1$$');
  
  // 2. Replace \[...\] with $...$
  clean = clean.replace(/\\\[([\s\S]*?)\\\]/g, '$$$1$$');
  
  // 3. Remove \displaystyle which forces large vertical spacing
  clean = clean.replace(/\\displaystyle/g, '');
  
  // 4. Remove equation environments
  clean = clean.replace(/\\begin\{equation\}/g, '$').replace(/\\end\{equation\}/g, '$');
  clean = clean.replace(/\\begin\{align\}/g, '$').replace(/\\end\{align\}/g, '$');
  
  // 5. Fix common newlines often added by AI around Math
  // This regex finds newlines surrounding $...$ and removes them
  clean = clean.replace(/\n\s*(\$)/g, ' $1').replace(/(\$)\s*\n/g, '$1 ');

  return clean;
};

export const generateQuizContent = async (
  params: QuizGenerationParams,
  factCheck: boolean = true
): Promise<{ questions: Question[], blueprint: Blueprint[] }> => {
  // 1. Ensure API Key is available/selected
  await ensureApiKey();

  const textModel = 'gemini-3-flash-preview';
  const ai = createAIClient();

  // 2. Construct the System Instruction
  const subjectSpecifics = getSubjectInstruction(params.subject, params.subjectCategory);
  
  const cognitiveRange = params.cognitiveLevels.join(', ');
  const typesList = params.types.join(', ');

  let systemInstruction = `
    You are an expert curriculum developer for the Indonesian 'Kurikulum Merdeka'.
    Your task is to generate a high-quality exam quiz based on the provided parameters.

    ${subjectSpecifics}
    
    Target Audience: ${params.level} - ${params.grade}
    Topic: ${params.topic}
    Sub-Topic: ${params.subTopic || 'General'}
    
    Reference Material:
    ${params.materialText ? `Use the following summary text as the PRIMARY source for questions:\n"${params.materialText.substring(0, 10000)}..."` : 'Use your general knowledge base aligned with the curriculum.'}

    Configuration:
    - Total Questions: ${params.questionCount}
    - Difficulty: ${params.difficulty}
    - Cognitive Levels allowed: ${cognitiveRange}
    - Question Types allowed: ${typesList}
    - Multiple Choice Options: ${params.mcOptionCount} (only for MC type)
    - Image Requirements: Approximately ${params.imageQuestionCount} questions must require a visual aid. For these, provide a highly descriptive 'imagePrompt'.

    Rules:
    1. For 'ESSAY' and 'SHORT_ANSWER', 'options' must be an empty array.
    2. For 'COMPLEX_MULTIPLE_CHOICE', 'correctAnswer' should be a string containing all correct keys (e.g., "A, C").
    3. For 'MULTIPLE_CHOICE', provide exactly ${params.mcOptionCount} options.
    4. Generate a 'Blueprint' (Kisi-kisi) for every question mapping it to a Basic Competency (KD/CP) and Indicator.
    5. FORMATTING: Ensure all text is formatted for direct rendering. Do not use markdown headers (#) or bolding (**) in the question text unless necessary. STRICTLY NO newlines inside the question stem unless it is a distinct paragraph. All math must be inline.
    6. Output JSON ONLY.
  `;

  // --- HANDLING READING MODES ---
  if (params.readingMode === 'grouped') {
    systemInstruction += `\n
    7. GROUPED STIMULUS MODE (Long Paragraph):
       - Generate a single, comprehensive, long reading passage (narrative/expository/dialogue) relevant to the topic (approx 300-500 words).
       - This passage MUST be placed in the 'stimulus' field of the **FIRST** question only.
       - The 'stimulus' field for all subsequent questions must be empty (null or "").
       - All generated questions must relate to this single passage.
    `;
  } else if (params.readingMode === 'simple') {
    systemInstruction += `\n
    7. SIMPLE STIMULUS MODE:
       - Every question must include a short, unique 'stimulus' text (paragraph, quote, or case study) acting as context.
    `;
  } else {
    // None
    systemInstruction += `\n
    7. NO STIMULUS MODE:
       - Do not include reading passages. Questions should be direct. 'stimulus' field should be null.
    `;
  }

  if (factCheck) {
     systemInstruction += `\nSTRICT FACT CHECKING: Ensure all historical dates, scientific formulas, and factual statements are verified. If uncertain about a specific detail, verify logic step-by-step.`;
  }

  // 3. Define Schema
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "The question stem. Use single '$' for inline LaTeX math. No line breaks." },
            type: { type: Type.STRING, enum: Object.values(QuestionType) },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            cognitiveLevel: { type: Type.STRING },
            stimulus: { type: Type.STRING, nullable: true, description: "Reading passage or context." },
            imagePrompt: { type: Type.STRING, nullable: true, description: "Prompt for Gemini Image gen if visual is needed." },
          },
          required: ['text', 'type', 'options', 'correctAnswer', 'explanation', 'difficulty', 'cognitiveLevel']
        }
      },
      blueprint: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            questionNumber: { type: Type.INTEGER },
            basicCompetency: { type: Type.STRING },
            indicator: { type: Type.STRING },
            cognitiveLevel: { type: Type.STRING },
            difficulty: { type: Type.STRING }
          }
        }
      }
    }
  };

  try {
    // 4. Generate Text Content
    const response = await ai.models.generateContent({
      model: textModel,
      contents: [
        {
          role: 'user',
          parts: [
            { text: `Generate ${params.questionCount} questions about ${params.topic}. Reading Mode: ${params.readingMode}.` },
            // If reference image exists, add it to prompt context
            ...(params.refImageBase64 ? [{
              inlineData: {
                mimeType: "image/jpeg", // Assuming jpeg for simplicity, logic handles base64
                data: params.refImageBase64.split(',')[1] 
              }
            }, { text: "Use this image as a reference context for the questions." }] : [])
          ]
        }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
        // Add Safety Settings to prevent blocking harmless educational content
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
      }
    });

    let text = response.text;
    
    // Safety check for empty response
    if (!text || text.trim().length === 0) {
        // Fallback: Try to retrieve from candidates if text accessor failed but data exists
        const candidate = response.candidates?.[0];
        if (candidate?.finishReason !== 'STOP') {
             throw new Error(`AI generation stopped unexpectedly. Reason: ${candidate?.finishReason || 'Unknown'}`);
        }
        throw new Error("AI returned empty response. Try reducing question count or changing topic.");
    }
    
    // Clean potential markdown wrapping if somehow the model adds it despite mimeType
    text = text.trim();
    if (text.startsWith("```json")) {
        text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (text.startsWith("```")) {
        text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch (e) {
        console.error("JSON Parse Error. Raw Text:", text);
        throw new Error("Gagal memproses format data dari AI (Invalid JSON). Silakan coba lagi.");
    }
    
    // 5. Post-process & Sanitize Math
    const processedQuestions = parsed.questions.map((q: any, idx: number) => ({
      ...q,
      id: `gen-${Date.now()}-${idx}`,
      text: sanitizeLatex(q.text), // Sanitize Text
      explanation: sanitizeLatex(q.explanation), // Sanitize Explanation
      options: q.options ? q.options.map((opt: string) => sanitizeLatex(opt)) : [], // Sanitize Options
      stimulus: sanitizeLatex(q.stimulus), // Sanitize Stimulus
      hasImage: !!q.imagePrompt,
      hasImageInOptions: false,
      imageUrl: undefined 
    }));

    return {
      questions: processedQuestions,
      blueprint: parsed.blueprint || []
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const generateImageForQuestion = async (prompt: string): Promise<string> => {
  await ensureApiKey(); // Ensure key for image gen too
  const imageModel = 'gemini-2.5-flash-image';
  const ai = createAIClient();

  try {
    const response = await ai.models.generateContent({
      model: imageModel,
      contents: prompt,
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return generateSvgFallback(prompt);

  } catch (error) {
    console.warn("Image gen failed, using SVG fallback", error);
    return generateSvgFallback(prompt);
  }
};

const generateSvgFallback = (prompt: string): string => {
  const bg = "#fff7ed"; // brand-50
  const stroke = "#f97316"; // brand-500
  const text = prompt.length > 30 ? prompt.substring(0, 30) + "..." : prompt;
  
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bg}"/>
      <circle cx="200" cy="150" r="80" stroke="${stroke}" stroke-width="3" fill="none" opacity="0.5"/>
      <path d="M150 150 L250 150 M200 100 L200 200" stroke="${stroke}" stroke-width="3" opacity="0.5"/>
      <text x="50%" y="90%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#c2410c">
        ${text}
      </text>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="bold" fill="#ea580c">
        IMG
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};