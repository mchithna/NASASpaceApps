import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { citationViewFor } from '@/engine/sceneRenderers.ts'
import { createStructuralFixture, structuralFixtureNotice } from '@/engine/fixture.ts'
import { narrationLabels, type EvidenceScene, type StoryScene } from '@/engine/scenes.ts'
import { DiscoverySceneView } from '@/engine/scenes/DiscoverySceneView.tsx'
import { EndingSceneView } from '@/engine/scenes/EndingSceneView.tsx'
import { EvidenceSceneView } from '@/engine/scenes/EvidenceSceneView.tsx'
import { StorySceneView } from '@/engine/scenes/StorySceneView.tsx'
import { TypedSceneView } from '@/engine/scenes/TypedSceneView.tsx'
import { safeExternalUrl, safeMediaSrc } from '@/engine/scenes/urls.ts'

const fixture = createStructuralFixture()

function storyScene(): StoryScene {
  const scene = fixture.scenes.find((item) => item.kind === 'story')
  if (!scene || scene.kind !== 'story') {
    throw new Error('Fixture story scene is missing.')
  }
  return scene
}

function evidenceScene(): EvidenceScene {
  const scene = fixture.scenes.find((item) => item.kind === 'evidence')
  if (!scene || scene.kind !== 'evidence') {
    throw new Error('Fixture evidence scene is missing.')
  }
  return scene
}

describe('scene address checks', () => {
  it('keeps normal web addresses and site paths', () => {
    expect(safeExternalUrl('https://science.nasa.gov/mission/surveyor-3/')).toBe(
      'https://science.nasa.gov/mission/surveyor-3/',
    )
    expect(safeMediaSrc('/training/sketch.png')).toBe('/training/sketch.png')
  })

  it('blocks script addresses, credentials, and parent paths', () => {
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull()
    expect(safeExternalUrl('https://user:secret@example.com/file')).toBeNull()
    expect(safeMediaSrc('../secret.png')).toBeNull()
    expect(safeMediaSrc('data:text/html,hi')).toBeNull()
  })
})

describe('story and evidence scenes', () => {
  it('shows academy narration without calling the text a NASA quotation', () => {
    const scene = storyScene()
    render(
      <StorySceneView
        scene={scene}
        citation={citationViewFor(fixture.mission, scene)}
      />,
    )

    expect(
      screen.getByRole('heading', { level: 3, name: 'Fixture opening' }),
    ).toBeInTheDocument()
    const body = screen.getByText(structuralFixtureNotice)
    expect(body.tagName).toBe('P')
    expect(screen.queryByRole('blockquote')).not.toBeInTheDocument()
    expect(screen.getByText(narrationLabels.academy)).toBeInTheDocument()
    expect(screen.getByText(/not a NASA quotation/i)).toBeInTheDocument()
    expect(screen.getByText(/does not cite a NASA source/i)).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows a mission source link and the mixed narration label', () => {
    const scene = evidenceScene()
    render(
      <EvidenceSceneView
        scene={{
          ...scene,
          instruction: 'Compare the training sentence with the listed source.',
        }}
        citation={citationViewFor(fixture.mission, scene)}
      />,
    )

    expect(
      screen.getByRole('link', { name: 'Surveyor 3 — NASA Science' }),
    ).toHaveAttribute('href', 'https://science.nasa.gov/mission/surveyor-3/')
    expect(screen.getByText(narrationLabels.mixed)).toBeInTheDocument()
    expect(screen.getByText(/not a NASA quotation/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Compare the training sentence with the listed source/),
    ).toBeInTheDocument()
  })

  it('labels a simulation without treating the numbers as measurements', () => {
    const scene = storyScene()
    render(
      <StorySceneView
        scene={{
          ...scene,
          framing: 'simulation',
          body: 'Training count: 3 desks in the practice room.',
        }}
        citation={citationViewFor(fixture.mission, scene)}
      />,
    )

    expect(screen.getByText('Simulation')).toBeInTheDocument()
    expect(screen.getByText(/not NASA measurements/i)).toBeInTheDocument()
    expect(
      screen.getByText('Training count: 3 desks in the practice room.'),
    ).toBeInTheDocument()
  })

  it('does not link a source that is missing or has an unsafe address', () => {
    const scene = evidenceScene()
    const mission = {
      ...fixture.mission,
      sources: [
        {
          id: 'blocked-link',
          title: 'Blocked training source',
          url: 'javascript:alert(1)',
        },
      ],
    }
    const blocked: EvidenceScene = {
      ...scene,
      narration: 'factual',
      framing: 'factual',
      sourceIds: ['blocked-link', 'missing-source'],
      body: 'Training sentence for a blocked source.',
    }

    render(
      <EvidenceSceneView
        scene={blocked}
        citation={citationViewFor(mission, blocked)}
      />,
    )

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('Blocked training source')).toBeInTheDocument()
    expect(
      screen.getByText(/not a normal web address/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/not on this mission/i)).toBeInTheDocument()
    expect(screen.getByText('Factual')).toBeInTheDocument()
    expect(screen.getByText(/not labeled as a NASA quotation/i)).toBeInTheDocument()
  })

  it('shows an empty picture state and a picture error fallback', () => {
    const scene = storyScene()
    const { rerender } = render(
      <StorySceneView
        scene={{ ...scene, media: null }}
        citation={citationViewFor(fixture.mission, scene)}
      />,
    )

    expect(screen.getByText('No picture')).toBeInTheDocument()
    expect(screen.getByText(/No picture was added/i)).toBeInTheDocument()

    rerender(
      <StorySceneView
        scene={{
          ...scene,
          media: {
            src: 'https://example.com/training-sketch.png',
            alt: 'Training sketch of a desk',
          },
        }}
        citation={citationViewFor(fixture.mission, scene)}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Loading picture')
    fireEvent.error(screen.getByRole('img', { name: 'Training sketch of a desk' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Training sketch of a desk')
    expect(screen.getByRole('alert')).toHaveTextContent(/could not be shown/i)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows an empty text state when the body is blank', () => {
    const scene = storyScene()
    render(
      <StorySceneView
        scene={{ ...scene, body: '   ' }}
        citation={citationViewFor(fixture.mission, scene)}
      />,
    )

    expect(screen.getByText('No scene text')).toBeInTheDocument()
  })
})

describe('discovery and ending callbacks', () => {
  it('asks to save a discovery id and does not mention points being awarded', async () => {
    const user = userEvent.setup()
    const scene = fixture.scenes.find((item) => item.kind === 'discovery')
    if (!scene || scene.kind !== 'discovery') {
      throw new Error('Fixture discovery scene is missing.')
    }
    const onUnlockRequest = vi.fn()

    render(
      <DiscoverySceneView
        missionId={fixture.mission.id}
        scene={{
          ...scene,
          body: 'Training explanation for a practice discovery. Not a NASA finding.',
        }}
        citation={citationViewFor(fixture.mission, scene)}
        onUnlockRequest={onUnlockRequest}
      />,
    )

    const button = screen.getByRole('button', { name: 'Ask to save this discovery' })
    button.focus()
    expect(button).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(onUnlockRequest).toHaveBeenCalledTimes(1)
    expect(onUnlockRequest).toHaveBeenCalledWith({
      missionId: 'surveyor-3',
      discoveryId: 'fixture-note',
    })
    expect(screen.getByRole('status')).toHaveTextContent(
      'Points are not added here.',
    )
    expect(screen.queryByText(/XP/)).not.toBeInTheDocument()
  })

  it('sends an ending callback with the mission and scene ids', async () => {
    const user = userEvent.setup()
    const scene = fixture.scenes.find((item) => item.kind === 'ending')
    if (!scene || scene.kind !== 'ending') {
      throw new Error('Fixture ending scene is missing.')
    }
    const onEnding = vi.fn()

    render(
      <EndingSceneView
        missionId={fixture.mission.id}
        scene={scene}
        citation={citationViewFor(fixture.mission, scene)}
        onEnding={onEnding}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Finish this scene' }))
    expect(onEnding).toHaveBeenCalledWith({
      missionId: 'surveyor-3',
      sceneId: 'fixture-ending',
    })
    expect(screen.getByRole('status')).toHaveTextContent(
      'Points are not added here.',
    )
  })
})

describe('unknown scene type', () => {
  it('shows a safe fallback', () => {
    render(
      <TypedSceneView
        missionId="surveyor-3"
        scene={{ kind: 'quiz' }}
        citation={{
          narration: 'academy',
          label: narrationLabels.academy,
          sources: [],
        }}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('This scene cannot be shown')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
