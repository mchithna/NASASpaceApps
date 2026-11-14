import { createBrowserRouter, type RouteObject } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout.tsx'
import { MissionLayout } from '@/components/layout/MissionLayout.tsx'
import { PublicLayout } from '@/components/layout/PublicLayout.tsx'
import { AchievementsPage } from '@/pages/AchievementsPage.tsx'
import { AuthPage } from '@/pages/AuthPage.tsx'
import { DashboardPage } from '@/pages/DashboardPage.tsx'
import { JournalPage } from '@/pages/JournalPage.tsx'
import { LandingPage } from '@/pages/LandingPage.tsx'
import { MissionOverviewPage } from '@/pages/MissionOverviewPage.tsx'
import { MissionPlayerPage } from '@/pages/MissionPlayerPage.tsx'
import { NotFoundPage } from '@/pages/NotFoundPage.tsx'
import { OnboardingPage } from '@/pages/OnboardingPage.tsx'
import { ProfilePage } from '@/pages/ProfilePage.tsx'
import { LoadingState } from '@/components/ui/LoadingState.tsx'

const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: '/dev/training-simulator',
        hydrateFallbackElement: <LoadingState label="Loading training simulator" />,
        lazy: async () => {
          const { TrainingSimulatorPreview } =
            await import('@/engine/training/TrainingSimulatorPreview.tsx')
          return { Component: TrainingSimulatorPreview }
        },
      },
      {
        path: '/dev/components',
        hydrateFallbackElement: <LoadingState label="Loading component preview" />,
        lazy: async () => {
          const { ComponentShowcasePage } =
            await import('@/pages/ComponentShowcasePage.tsx')
          return { Component: ComponentShowcasePage }
        },
      },
    ]
  : []

export const appRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/auth', element: <AuthPage /> },
      { path: '/onboarding', element: <OnboardingPage /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/journal', element: <JournalPage /> },
      { path: '/achievements', element: <AchievementsPage /> },
    ],
  },
  {
    path: '/missions/:missionId',
    element: <MissionLayout />,
    children: [
      { index: true, element: <MissionOverviewPage /> },
      { path: 'play', element: <MissionPlayerPage /> },
    ],
  },
  ...devRoutes,
  { path: '*', element: <NotFoundPage /> },
]

export const router = createBrowserRouter(appRoutes)
