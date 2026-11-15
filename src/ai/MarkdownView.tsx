import { type ReactNode } from 'react'

/**
 * Lightweight, safe Markdown renderer for Nova chat replies.
 * Supports bold, italics, inline code, external links, paragraphs, and unordered/ordered lists.
 */
export function MarkdownView({ content }: { content: string }) {
  const blocks = parseBlocks(content)

  return (
    <div className="nova-markdown">
      {blocks.map((block, i) => {
        if (block.type === 'ul') {
          return (
            <ul key={i} className="nova-md-list">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          )
        }
        if (block.type === 'ol') {
          return (
            <ol key={i} className="nova-md-list">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ol>
          )
        }
        return (
          <p key={i} className="nova-md-para">
            {renderInline(block.text)}
          </p>
        )
      })}
    </div>
  )
}

type Block =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.split('\n')
  const blocks: Block[] = []
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null
  let currentParagraphLines: string[] = []

  function flushParagraph() {
    if (currentParagraphLines.length > 0) {
      const text = currentParagraphLines.join('\n').trim()
      if (text) {
        blocks.push({ type: 'p', text })
      }
      currentParagraphLines = []
    }
  }

  function flushList() {
    if (currentList && currentList.items.length > 0) {
      blocks.push(currentList)
      currentList = null
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      flushParagraph()
      flushList()
      continue
    }

    // Check for bullet list item: "- " or "* "
    const ulMatch = line.match(/^[-*]\s+(.*)$/)
    if (ulMatch) {
      flushParagraph()
      if (!currentList || currentList.type !== 'ul') {
        flushList()
        currentList = { type: 'ul', items: [] }
      }
      currentList.items.push(ulMatch[1])
      continue
    }

    // Check for numbered list item: "1. "
    const olMatch = line.match(/^\d+\.\s+(.*)$/)
    if (olMatch) {
      flushParagraph()
      if (!currentList || currentList.type !== 'ol') {
        flushList()
        currentList = { type: 'ol', items: [] }
      }
      currentList.items.push(olMatch[1])
      continue
    }

    // Regular text line
    flushList()
    currentParagraphLines.push(rawLine)
  }

  flushParagraph()
  flushList()

  return blocks
}

/** Parses inline markdown: bold, italics, code, links, and line breaks */
function renderInline(text: string): ReactNode[] {
  // Regex pattern matching:
  // 1. Links: [label](url)
  // 2. Bold: **text**
  // 3. Italic: *text*
  // 4. Code: `text`
  const tokenRegex =
    /(\[[^\]]+\]\([^\s)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\n)/g

  const parts = text.split(tokenRegex)
  return parts.map((part, index) => {
    if (!part) return null

    if (part === '\n') {
      return <br key={index} />
    }

    // Link: [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/)
    if (linkMatch) {
      const href = linkMatch[2]
      const label = linkMatch[1]
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="nova-md-link"
        >
          {label}
        </a>
      )
    }

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="nova-md-bold">
          {part.slice(2, -2)}
        </strong>
      )
    }

    // Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return <em key={index}>{part.slice(1, -1)}</em>
    }

    // Code: `text`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={index} className="nova-md-code">
          {part.slice(1, -1)}
        </code>
      )
    }

    return part
  })
}
