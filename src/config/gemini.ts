/**
 * Centralized Gemini API Configuration.
 *
 * To update the Gemini API key across the entire application,
 * simply update `VITE_GEMINI_API_KEY` in your `.env` file.
 */
export const geminiConfig = {
  apiKey: (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ?? '',
  isConfigured: Boolean(import.meta.env.VITE_GEMINI_API_KEY),
}

export function getGeminiApiKey(): string {
  return geminiConfig.apiKey
}
