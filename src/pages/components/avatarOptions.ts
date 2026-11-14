import { Rocket, Moon, Compass, Sun } from 'lucide-react'
import { avatarIds, type AvatarId } from '@/contracts/explorer.ts'

export type AvatarOption = {
  id: AvatarId
  name: string
  specialty: string
  icon: typeof Rocket
  badgeVariant: 'science' | 'reward' | 'success' | 'neutral'
}

export const avatarOptions: readonly AvatarOption[] = [
  {
    id: 'cadet-1',
    name: 'Lunar Surveyor',
    specialty: 'Moon Surface Specialist',
    icon: Moon,
    badgeVariant: 'science',
  },
  {
    id: 'cadet-2',
    name: 'Mars Rover Pilot',
    specialty: 'Planetary Geology & Navigation',
    icon: Compass,
    badgeVariant: 'reward',
  },
  {
    id: 'cadet-3',
    name: 'Deep Space Pioneer',
    specialty: 'Outer Solar System & Trajectories',
    icon: Rocket,
    badgeVariant: 'neutral',
  },
  {
    id: 'cadet-4',
    name: 'Helio Scout',
    specialty: 'Solar Wind & Radiation Science',
    icon: Sun,
    badgeVariant: 'success',
  },
]

export function isPredefinedAvatarId(id: string): id is AvatarId {
  return (avatarIds as readonly string[]).includes(id)
}
