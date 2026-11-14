import { useState } from 'react'
import { LayoutGrid, Radar, Telescope, UserRound } from 'lucide-react'
import { AppHeader } from '@/components/layout/AppHeader.tsx'
import { SidebarNav } from '@/components/layout/SidebarNav.tsx'
import { SkipLink } from '@/components/layout/SkipLink.tsx'
import { Badge } from '@/components/ui/Badge.tsx'
import { Button } from '@/components/ui/Button.tsx'
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@/components/ui/Card.tsx'
import { Dialog } from '@/components/ui/Dialog.tsx'
import { EmptyState } from '@/components/ui/EmptyState.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { LoadingSkeleton, LoadingState } from '@/components/ui/LoadingState.tsx'
import { PageHeader } from '@/components/ui/PageHeader.tsx'
import { ProgressBar } from '@/components/ui/ProgressBar.tsx'
import { SectionContainer } from '@/components/ui/SectionContainer.tsx'
import { focusRing } from '@/components/ui/focusRing.ts'
import { useRouteFocus } from '@/hooks/useRouteFocus.ts'

const demoNav = [
  { to: '/dev/components', label: 'Preview', end: true, icon: LayoutGrid },
  { to: '/dashboard', label: 'Mission Control', icon: Radar },
  { to: '/profile', label: 'Profile', icon: UserRound },
] as const

export function ComponentShowcasePage() {
  const mainRef = useRouteFocus()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-svh bg-background text-foreground">
      <SkipLink />
      <AppHeader items={demoNav} label="Preview" />
      <main id="main-content" ref={mainRef} tabIndex={-1} className={focusRing}>
        <SectionContainer className="flex flex-col gap-12">
          <PageHeader
            title="Component preview"
            description="A development-only view of the shared NovaExplorer components. It is not linked from the app navigation, and it is left out of production builds."
          />

          <section className="flex flex-col gap-4">
            <h2 className="text-2xl text-foreground">Typography</h2>
            <p className="font-heading text-4xl text-foreground">
              Space Grotesk for headings
            </p>
            <p className="max-w-[65ch] text-lg text-secondary">
              Inter is used for reading, labels, buttons, and navigation. Lines
              stay short enough to finish on a phone.
            </p>
            <p className="text-sm font-medium text-muted">
              Muted text is for supporting labels.
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-2xl text-foreground">Buttons</h2>
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="small">Small</Button>
              <Button size="medium">Medium</Button>
              <Button size="large">Large</Button>
              <Button disabled>Disabled</Button>
              <Button
                loading={loading}
                onClick={() => {
                  setLoading(true)
                  window.setTimeout(() => setLoading(false), 1200)
                }}
              >
                {loading ? 'Saving' : 'Show loading'}
              </Button>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-2xl text-foreground">Cards</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader
                  title="Standard"
                  description="A quiet surface for story notes."
                />
                <CardBody>
                  <p className="text-secondary">Body content sits inside.</p>
                </CardBody>
              </Card>
              <Card variant="elevated">
                <CardHeader title="Elevated" description="A raised panel." />
                <CardFooter>
                  <Button size="small" variant="secondary">
                    Details
                  </Button>
                </CardFooter>
              </Card>
              <Card variant="interactive">
                <CardHeader
                  title="Interactive"
                  description="The border shifts when a pointer hovers. Put the link inside the card."
                />
                <CardFooter>
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => setDialogOpen(true)}
                  >
                    Open dialog
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-2xl text-foreground">Badges</h2>
            <div className="flex flex-wrap gap-2">
              <Badge>Neutral</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="science">Science</Badge>
              <Badge variant="reward">Reward</Badge>
            </div>
          </section>

          <section className="flex max-w-xl flex-col gap-4">
            <h2 className="text-2xl text-foreground">Progress</h2>
            <ProgressBar label="Explorer progress" value={0} valueLabel="0%" />
            <ProgressBar label="Story progress" value={42} valueLabel="42%" />
            <ProgressBar
              label="Chapter progress"
              value={100}
              valueLabel="100%"
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl text-foreground">Loading</h2>
              <LoadingState label="Loading the story" />
              <LoadingSkeleton />
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl text-foreground">Empty and error</h2>
              <EmptyState
                icon={Telescope}
                title="No notes yet"
                description="The journal will keep findings here after a story is written."
                action={
                  <Button variant="secondary">Start a placeholder</Button>
                }
              />
              <ErrorState
                message="The story could not be opened. Nothing was changed."
                action={
                  <Button variant="secondary" onClick={() => undefined}>
                    Try again
                  </Button>
                }
              />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-2xl text-foreground">Dialog</h2>
            <p className="max-w-[65ch] text-secondary">
              Open the dialog, then press Escape or choose Close. Focus returns
              to the button that opened it.
            </p>
            <div>
              <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
            </div>
            <Dialog
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              title="Mission note"
              description="This dialog is a sample. It does not save anything."
            >
              <Button onClick={() => setDialogOpen(false)}>Done</Button>
            </Dialog>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-2xl text-foreground">Navigation</h2>
            <p className="max-w-[65ch] text-secondary">
              The bar at the top is the shared header. On a narrow screen it
              swaps the links for a menu. The sidebar is for a future Mission
              Control layout.
            </p>
            <SidebarNav items={demoNav} label="Preview sections" />
          </section>
        </SectionContainer>
      </main>
    </div>
  )
}
