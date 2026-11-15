import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { NovaMissionCommander } from './NovaMissionCommander.tsx'
import { NovaAiProvider } from '../context/AiContext.tsx'
import { listMissions } from '@/missions/registry.ts'

describe('NovaMissionCommander component', () => {
  const missions = listMissions()

  it('renders Mission Commander heading and recommended mission', () => {
    render(
      <MemoryRouter>
        <NovaAiProvider route="/dashboard">
          <NovaMissionCommander
            profile={{
              explorerId: 'exp-1',
              kind: 'guest',
              nickname: 'NovaPilot',
              avatarId: 'cadet-1',
              totalXp: 120,
              createdAt: '2026-11-15T10:00:00Z',
              updatedAt: '2026-11-15T10:00:00Z',
              rank: {
                level: 2,
                id: 'lunar-explorer',
                name: 'Lunar Explorer',
                minXp: 100,
                totalXp: 120,
                nextRankId: 'planetary-explorer',
                nextRankName: 'Planetary Explorer',
                nextRankMinXp: 200,
                xpUntilNextRank: 80,
              },
            }}
            progress={{
              missions: [
                {
                  missionId: 'surveyor-3',
                  status: 'completed',
                  currentCheckpointId: null,
                  completedCheckpointIds: ['1', '2', '3'],
                  completedAt: '2026-11-15T12:00:00Z',
                  updatedAt: '2026-11-15T12:00:00Z',
                },
              ],
            }}
            missions={missions}
            journalCount={2}
          />
        </NovaAiProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Mission Commander')).toBeInTheDocument()
    expect(screen.getByText(/Academy Briefing & Learning Roadmap/i)).toBeInTheDocument()
    // Since surveyor-3 is completed, opportunity should be recommended
    expect(screen.getByText('Opportunity')).toBeInTheDocument()
  })

  it('allows answering the daily science question and reveals NASA explanation', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <NovaAiProvider route="/dashboard">
          <NovaMissionCommander
            profile={null}
            progress={null}
            missions={missions}
            journalCount={0}
          />
        </NovaAiProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Science Question of the Day')).toBeInTheDocument()

    const correctOption = screen.getByRole('button', {
      name: /hematite spherules/i,
    })
    await user.click(correctOption)

    expect(screen.getByText(/precipitated from ancient, acidic groundwater/i)).toBeInTheDocument()
    expect(screen.getByText(/NASA Mars Exploration Rover Opportunity Science Archive/i)).toBeInTheDocument()
  })
})
