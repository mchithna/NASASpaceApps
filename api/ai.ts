import {
  handleAiRequest,
  type ServerRequest,
  type ServerResponse,
} from '../services/ai/router.ts'

export default async function handler(
  req: ServerRequest,
  res: ServerResponse,
): Promise<void> {
  await handleAiRequest(req, res)
}
