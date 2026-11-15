import { RouterProvider } from 'react-router'
import { AppProviders } from '@/app/providers/AppProviders.tsx'
import { router } from '@/app/router.tsx'
import { CompanionMount } from '@/ai/CompanionMount.tsx'

export default function App() {
  return (
    <AppProviders>
      <CompanionMount>
        <RouterProvider router={router} />
      </CompanionMount>
    </AppProviders>
  )
}
