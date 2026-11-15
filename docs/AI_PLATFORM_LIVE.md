# Nova AI Platform — Real-Time Multimodal Educational Architecture

**Branch:** `feature/nova-ai-live`  
**Target:** `develop`  
**Date:** November 2026  
**Audience:** School-age learners, ages 10–17  
**Challenge:** NASA Space Apps Challenge 2026 — *Abandoned But Not Forgotten*

---

## 1. Executive Summary

NovaExplorer's AI companion has been transformed from a static, local source-guide into a genuinely intelligent, real-time, multimodal educational assistant. Nova is fully integrated across the entire platform, notably featuring the **Nova AI Mission Commander** in Mission Control, real-time audio-reactive voice interaction, streaming chat responses, and verified NASA scientific grounding.

---

## 2. Architecture & Provider Layer

### 2.1 Provider Selection & Models
- **Inference Model:** `gemini-3.5-flash` (with automatic failover to `gemini-3.5-flash-lite`).
- **Voice Synthesis Model:** `gemini-3.8-flash-tts` generating native `audio/wav` output.
- **Provider Abstraction:** Clean `AiProvider` interface (`services/ai/types.ts`) decoupling application logic from vendor SDKs.

### 2.2 Security, Key Rotation & Exclusion
- **Server-Side Only:** Keys (`GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, `GEMINI_API_KEY_3`) are accessed strictly in server environments (`services/ai/` and Vercel serverless functions in `api/ai.ts`).
- **Zero Frontend Leakage:** Vite bundle scans confirm zero secret references or API keys in `dist/assets/`.
- **Automatic Key Rotation:** `GeminiProvider` rotates keys across available slots upon encountering rate limits (HTTP 429) or quota exhaustion.
- **Vite Dev Middleware:** `vite.config.ts` incorporates `aiDevServerPlugin` to route `/api/ai/*` to the server-side provider in local development (`npm run dev`) without needing separate runner processes.

---

## 3. Child Safety, Privacy & Ethical Guardrails

- **Age Group (10–17):** Strict child-safety guardrails reject profanity, harmful content, and personal data harvesting (SSNs, emails, credit cards, passwords).
- **Prompt Injection Defenses:** Regex and pattern analysis reject attempts to override system instructions or extract keys.
- **Output Redaction:** Built-in output sanitizer strips accidental key leaks.
- **Zero Audio & History Retention:** Conversation memory is bounded to 20 exchanges in session/React memory only. No voice recordings or student transcripts are stored by default.
- **Progression Isolation:** Nova AI has strictly read-only access to mission telemetry. The AI cannot award XP, bypass scenes, or unlock achievements.

---

## 4. Grounding in Authoritative NASA Sources

- **Mission Contexts:** Grounded facts for Surveyor 3, Opportunity, Ingenuity, InSight, and Pioneer 10.
- **Source Citations:** Every factual response returns authoritative NASA citations (e.g., `science.nasa.gov`, JPL).
- **Dynamic Follow-Ups:** AI generates 4 contextual follow-up questions tailored to the explorer's line of inquiry.
- **Explain Simply:** Dynamic age-appropriate simplification toggle adapting explanations to plain English with vivid analogies.

---

## 5. Real-Time Multimodal Voice AI

- **Explicit Mic Capture:** Microphone permission requested cleanly via `navigator.mediaDevices.getUserMedia`.
- **Audio Analyser:** Web Audio `AnalyserNode` extracts real-time amplitude to drive the audio-reactive waveform and 3D Nova avatar glow.
- **Natural Interruption:** If the user speaks or taps Stop/Mute while Nova is speaking, audio playback halts immediately (`HTMLAudioElement.pause()` + `AbortController.abort()`).
- **Real Waveform Visualizer:** Waveform reacts to live audio frequency data rather than looping fake animations.

---

## 6. Page-Wide Integration Surfaces

| Page / Surface | AI Feature | Grounding / Source |
|---|---|---|
| **Mission Control (Dashboard)** | `NovaMissionCommander` | Analyzes rank, XP, and completed dossiers to recommend the next mission; daily science challenge. |
| **Global Companion** | `AiCompanion` | Floating 3D launcher with streaming chat, dynamic briefings, AI glossary, and voice interface. |
| **Landing Page** | `LandingAiGuide` | Interactive guide allowing visitors to explore the 5 abandoned spacecraft. |
| **Auth & Onboarding** | `AuthAiHelper` | Explains guest vs. account modes and student privacy safeguards. |
| **Explorer Profile** | `ProfileAiInsights` | Summarizes learning achievements, rank trajectory, and study goals. |
| **Mission Dossier** | `MissionScienceGuide` | Deep-dives into spacecraft history, instruments, and planetary science. |
| **Mission Player** | Route Context Copilot | Explains science in the active scene without giving away answers. |
| **Discovery Journal** | `JournalAiSynthesis` | Synthesizes connections between logged artifacts; compares Moon vs. Mars. |
| **Achievements** | `AchievementsAiGuide` | Official catalog milestone guidance. |

---

## 7. Verification & Validation Results

| Test / Check | Result | Details |
|---|---|---|
| `npm run typecheck` | **PASS** | 0 TypeScript errors across all application and server files. |
| `npm run lint` | **PASS** | 0 ESLint errors and 0 warnings. |
| `npx vitest run services/ai/` | **PASS** | 14/14 tests passed (safety, rate limiting, key rotation, grounding). |
| `npx vitest run src/ai/` | **PASS** | 8/8 tests passed (client, companion mount, source guide). |
| `npx vitest run src/ai/surfaces/NovaMissionCommander.test.tsx` | **PASS** | 2/2 tests passed (recommendations, question of the day). |
| `npm run build` | **PASS** | Production client bundle built in 4.46s; zero API keys in output. |
