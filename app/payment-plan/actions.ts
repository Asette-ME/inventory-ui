'use server';

interface GeminiRequestParams {
  prompt: string;
  systemInstruction?: string;
  useJsonMode?: boolean;
  imageBase64?: string | null;
  mimeType?: string;
}

export async function callGeminiAction({
  prompt,
  systemInstruction = '',
  useJsonMode = false,
  imageBase64 = null,
  mimeType = '',
}: GeminiRequestParams) {
  const apiKey = process.env.GEMINI_API_KEY;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  // Construct parts: Text prompt is always there
  const parts: Record<string, any>[] = [{ text: prompt }];

  // If we have an image, add it to the parts
  if (imageBase64 && mimeType) {
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: imageBase64,
      },
    });
  }

  const payload = {
    contents: [{ parts: parts }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: useJsonMode ? { responseMimeType: 'application/json' } : undefined,
  };

  // Simple exponential backoff retry logic
  const maxRetries = 3;
  let delay = 1000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Gemini API Error:', response.status, errorBody);
        throw new Error(`API Error: ${response.status} - ${errorBody}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

export async function savePaymentPlanAction(buildingId: string, paymentPlan: any[]) {
  const apiKey = process.env.ASETTE_BE_API_KEY;
  const baseUrl = process.env.ASETTE_BE_API_URL;

  if (!apiKey || !baseUrl) {
    throw new Error('API configuration missing');
  }

  const res = await fetch(`${baseUrl}/buildings/${buildingId}/payment-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(paymentPlan),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to save payment plan: ${res.status} ${errorText}`);
  }

  return await res.json();
}
