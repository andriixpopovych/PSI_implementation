import { CalendarDays, HousePlus, Menu, Search, UserCircle2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import { isHostPath, isReservationsPath, staySmartRoutes } from '../lib/routes';

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const hostActive = isHostPath(location.pathname);
  const reservationsActive = isReservationsPath(location.pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(staySmartRoutes.home)}
          className="group flex flex-col items-start gap-1 text-left"
        >
          <span className="font-display text-3xl font-black tracking-[-0.06em] text-foreground transition group-hover:text-primary sm:text-4xl">
            Stay Smart
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Thoughtful stays, quick decisions
          </span>
        </button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="hidden h-12 rounded-[1.1rem] border-white/80 bg-white/70 px-4 text-accent shadow-[0_12px_32px_rgba(89,61,34,0.08)] sm:inline-flex"
            onClick={() => navigate(staySmartRoutes.catalog)}
          >
            <Search className="size-4" />
            Find a Property
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-14 rounded-[1.35rem] border-white/80 bg-white/82 px-4 text-muted-foreground shadow-[0_12px_32px_rgba(89,61,34,0.1)]"
              >
                <Menu className="size-5 shrink-0" />
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-foreground/10 bg-white/80">
                  <UserCircle2 className="size-[18px]" />
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[min(360px,calc(100vw-24px))] p-3">
              <DropdownMenuLabel className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <span className="font-display text-2xl font-black tracking-[-0.05em]">
                    Menu
                  </span>
                  <span className="text-sm text-muted-foreground">Fast access to account screens.</span>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className={cn(
                  'rounded-3xl border border-transparent px-4 py-4 focus:bg-accent/8',
                  hostActive && 'border-accent/15 bg-accent/6',
                )}
                onSelect={() => navigate(staySmartRoutes.host)}
              >
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <HousePlus className="size-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-foreground">Host</span>
                    <span className="text-xs leading-5 text-muted-foreground">Listings and add new</span>
                  </div>
                </div>
                <DropdownMenuShortcut>Open</DropdownMenuShortcut>
              </DropdownMenuItem>

              <DropdownMenuItem
                className={cn(
                  'mt-2 rounded-3xl border border-transparent px-4 py-4 focus:bg-accent/8',
                  reservationsActive && 'border-accent/15 bg-accent/6',
                )}
                onSelect={() => navigate(staySmartRoutes.reservations)}
              >
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                    <CalendarDays className="size-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-foreground">Reservations</span>
                    <span className="text-xs leading-5 text-muted-foreground">Upcoming and past stays</span>
                  </div>
                </div>
                <DropdownMenuShortcut>Open</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
