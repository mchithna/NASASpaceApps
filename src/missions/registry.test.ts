import { describe, expect, it } from 'vitest'
import { listMissions, lookupMission } from '@/missions/registry.ts'
import { missionIds, type MissionDefinition } from '@/missions/types.ts'

const requiredText: (keyof MissionDefinition)[] = [
  'displayName',
  'chapterTitle',
  'description',
  'coverImage',
  'achievementId',
]

describe('mission registry', () => {
  it('lists all five missions in registry order', () => {
    const missions = listMissions()

    expect(missions.map((mission) => mission.id)).toEqual([...missionIds])
  })

  it('looks up a valid mission id', () => {
    const result = lookupMission('surveyor-3')

    expect(result.status).toBe('found')
    if (result.status !== 'found') {
      return
    }

    expect(result.mission.displayName).toBe('Surveyor 3')
    expect(result.mission.chapterTitle).toBe('The Robot They Came Back For')
    expect(result.mission.destination).toBe('Moon')
    expect(result.mission.status).toBe('available')
  })

  it('returns not-found for an unknown mission id', () => {
    expect(lookupMission('apollo-11')).toEqual({ status: 'not-found' })
    expect(lookupMission('Surveyor-3')).toEqual({ status: 'not-found' })
    expect(lookupMission('')).toEqual({ status: 'not-found' })
    expect(lookupMission('../surveyor-3')).toEqual({ status: 'not-found' })
  })

  it('keeps mission ids unique', () => {
    const ids = listMissions().map((mission) => mission.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toHaveLength(missionIds.length)
  })

  it('includes the required metadata for every mission', () => {
    const achievementIds = new Set<string>()

    for (const mission of listMissions()) {
      expect(missionIds).toContain(mission.id)
      expect(mission.destination.length).toBeGreaterThan(0)
      expect(mission.category.length).toBeGreaterThan(0)
      expect(mission.status).toBe(
        mission.id === 'surveyor-3' ||
          mission.id === 'opportunity' ||
          mission.id === 'ingenuity' ||
          mission.id === 'pioneer-10'
          ? 'available'
          : 'planned',
      )
      expect(mission.coverImage).toBe(
        mission.id === 'opportunity'
          ? '/assets/missions/opportunity/victoria-crater.jpg'
          : mission.id === 'ingenuity'
            ? '/assets/missions/ingenuity/ingenuity-mars.webp'
            : `/assets/missions/${mission.id}/cover.svg`,
      )

      for (const field of requiredText) {
        expect(mission[field]).toEqual(expect.any(String))
        expect(String(mission[field]).trim().length).toBeGreaterThan(0)
      }

      expect(mission.sources.length).toBeGreaterThan(0)
      for (const source of mission.sources) {
        expect(source.id.trim().length).toBeGreaterThan(0)
        expect(source.title.trim().length).toBeGreaterThan(0)
        expect(source.url).toMatch(/^https:\/\//)
      }

      expect(achievementIds.has(mission.achievementId)).toBe(false)
      achievementIds.add(mission.achievementId)
    }
  })
})
