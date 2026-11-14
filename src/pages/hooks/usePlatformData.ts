import { useCallback, useEffect, useState } from 'react'
import type { AuthSession } from '@/contracts/auth.ts'
import type { ExplorerProfile } from '@/contracts/explorer.ts'
import type { MissionProgressOverview, MissionProgress } from '@/contracts/progress.ts'
import type { ServiceError } from '@/contracts/result.ts'
import type {
  AchievementRecord,
  JournalEntry,
  XpSummary,
} from '@/contracts/rewards.ts'
import { useNovaServices } from '@/pages/context/useNovaServices.ts'

export type PlatformDataState = {
  session: AuthSession | null
  profile: ExplorerProfile | null
  progress: MissionProgressOverview | null
  xpSummary: XpSummary | null
  achievements: readonly AchievementRecord[]
  journalEntries: readonly JournalEntry[]
  isLoading: boolean
  error: ServiceError | null
  refresh: () => Promise<void>
}

export function usePlatformData(): PlatformDataState {
  const { services } = useNovaServices()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [profile, setProfile] = useState<ExplorerProfile | null>(null)
  const [progress, setProgress] = useState<MissionProgressOverview | null>(null)
  const [xpSummary, setXpSummary] = useState<XpSummary | null>(null)
  const [achievements, setAchievements] = useState<readonly AchievementRecord[]>([])
  const [journalEntries, setJournalEntries] = useState<readonly JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<ServiceError | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      const sessionResult = await services.auth.getSession()
      if (!sessionResult.ok) {
        setError(sessionResult.error)
        setIsLoading(false)
        return
      }

      setSession(sessionResult.data)

      if (
        sessionResult.data.status === 'signed-out' ||
        sessionResult.data.status === 'initializing'
      ) {
        setProfile(null)
        setProgress(null)
        setXpSummary(null)
        setAchievements([])
        setJournalEntries([])
        setIsLoading(sessionResult.data.status === 'initializing')
        return
      }

      const [
        profileResult,
        progressResult,
        xpResult,
        achievementsResult,
        journalResult,
      ] = await Promise.all([
        services.explorer.getProfile(),
        services.progress.getProgressOverview(),
        services.rewards.getXpSummary(),
        services.rewards.listAchievements(),
        services.rewards.listJournalEntries(),
      ])

      if (!profileResult.ok) {
        setError(profileResult.error)
        setIsLoading(false)
        return
      }

      if (!progressResult.ok) {
        setError(progressResult.error)
        setIsLoading(false)
        return
      }

      if (!xpResult.ok) {
        setError(xpResult.error)
        setIsLoading(false)
        return
      }

      if (!achievementsResult.ok) {
        setError(achievementsResult.error)
        setIsLoading(false)
        return
      }
      if (!journalResult.ok) {
        setError(journalResult.error)
        setIsLoading(false)
        return
      }

      const resolvedProfile: ExplorerProfile = {
        ...profileResult.data,
        totalXp: xpResult.data.totalXp,
        rank: xpResult.data.rank,
      }

      setProfile(resolvedProfile)
      setProgress(progressResult.data)
      setXpSummary(xpResult.data)
      setAchievements(achievementsResult.data)
      setJournalEntries(journalResult.data)
      setIsLoading(false)
    } catch {
      setError({
        code: 'unavailable',
        message: 'Unable to connect to NovaExplorer services.',
      })
      setIsLoading(false)
    }
  }, [services])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    await fetchAll()
  }, [fetchAll])

  useEffect(() => {
    let ignore = false

    const run = async () => {
      await fetchAll()
    }

    void run()

    const unsubscribe = services.auth.subscribe(() => {
      if (!ignore) {
        void fetchAll()
      }
    })

    return () => {
      ignore = true
      unsubscribe()
    }
  }, [services, fetchAll])

  return {
    session,
    profile,
    progress,
    xpSummary,
    achievements,
    journalEntries,
    isLoading,
    error,
    refresh,
  }
}

export function useMissionProgress(missionId: string): {
  progress: MissionProgress | null
  isLoading: boolean
  error: ServiceError | null
  refresh: () => Promise<void>
} {
  const { services } = useNovaServices()
  const [progress, setProgress] = useState<MissionProgress | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<ServiceError | null>(null)

  const fetchProgress = useCallback(async () => {
    const result = await services.progress.getMissionProgress(missionId)
    if (result.ok) {
      setProgress(result.data)
    } else {
      setError(result.error)
    }
    setIsLoading(false)
  }, [services, missionId])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    await fetchProgress()
  }, [fetchProgress])

  useEffect(() => {
    let ignore = false

    const run = async () => {
      const result = await services.progress.getMissionProgress(missionId)
      if (ignore) return
      if (result.ok) {
        setProgress(result.data)
      } else {
        setError(result.error)
      }
      setIsLoading(false)
    }

    void run()

    return () => {
      ignore = true
    }
  }, [services, missionId])

  return {
    progress,
    isLoading,
    error,
    refresh,
  }
}
