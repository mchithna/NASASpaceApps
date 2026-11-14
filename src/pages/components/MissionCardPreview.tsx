import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge.tsx'
import { Card } from '@/components/ui/Card.tsx'
import type { MissionDefinition } from '@/missions/types.ts'

export type MissionCardPreviewProps = {
  mission: MissionDefinition
}

export function MissionCardPreview({ mission }: MissionCardPreviewProps) {
  return (
    <Card
      variant="interactive"
      className="flex flex-col justify-between overflow-hidden"
    >
      <div>
        <div className="relative aspect-video w-full overflow-hidden bg-background">
          <img
            src={mission.coverImage}
            alt={`Cover illustration representing the ${mission.displayName} mission`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-3 right-3">
            <Badge variant="science">{mission.destination}</Badge>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-5">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-reward">
              {mission.chapterTitle}
            </span>
            <h3 className="font-heading text-xl font-bold text-foreground">
              <Link
                to={`/missions/${mission.id}`}
                className="hover:text-science focus-visible:outline-focus"
              >
                {mission.displayName}
              </Link>
            </h3>
          </div>

          <p className="line-clamp-3 text-sm text-secondary">
            {mission.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border bg-surface/50 px-5 py-3 text-xs">
        <span className="text-muted">
          {mission.sources.length} NASA Source{mission.sources.length === 1 ? '' : 's'}
        </span>
        <Link
          to={`/missions/${mission.id}`}
          className="font-medium text-science hover:underline focus-visible:outline-focus"
          aria-label={`Inspect ${mission.displayName} mission overview`}
        >
          View story &rarr;
        </Link>
      </div>
    </Card>
  )
}
