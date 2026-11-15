import { EventEmitter } from 'node:events'
import { beforeEach, expect, it, vi } from 'vitest'
import { handleAiRequest } from './router.ts'

const provider = vi.hoisted(() => ({
  streamChat: vi.fn(),
  generateChat: vi.fn(),
}))

vi.mock('./geminiProvider.ts', () => ({ getAiProvider: () => provider }))

beforeEach(() => vi.resetAllMocks())

async function requestStream() {
  const request = Object.assign(new EventEmitter(), {
    url: '/api/ai/chat',
    method: 'POST',
    headers: {},
    socket: { remoteAddress: 'router-test' },
  })
  const response = {
    statusCode: 200,
    setHeader: vi.fn(),
    write: vi.fn(() => true),
    end: vi.fn(),
  }
  const pending = handleAiRequest(request, response)
  request.emit(
    'data',
    JSON.stringify({
      messages: [{ role: 'user', content: 'What is a spacecraft?' }],
      stream: true,
    }),
  )
  request.emit('end')
  await pending
  return response
}

it('returns stream metadata without generating a second answer', async () => {
  provider.streamChat.mockImplementation(async (_request, onChunk) => {
    onChunk('Test answer')
    return {
      content: 'Test answer',
      sources: [],
      suggestedQuestions: [],
      model: 'test-model',
    }
  })
  const response = await requestStream()
  expect(provider.streamChat).toHaveBeenCalledTimes(1)
  expect(provider.generateChat).not.toHaveBeenCalled()
  expect(response.write).toHaveBeenCalledWith(
    'data: {"chunk":"Test answer"}\n\n',
  )
  expect(response.write).toHaveBeenCalledWith(
    expect.stringContaining('"done":true'),
  )
  expect(response.end).toHaveBeenCalledTimes(1)
})

it('emits the returned answer if the provider falls back without streaming chunks', async () => {
  provider.streamChat.mockResolvedValue({
    content: 'Fallback test answer',
    sources: [],
    suggestedQuestions: [],
    model: 'test-model',
  })
  const response = await requestStream()
  expect(response.write).toHaveBeenCalledWith(
    'data: {"chunk":"Fallback test answer"}\n\n',
  )
  expect(provider.generateChat).not.toHaveBeenCalled()
})
