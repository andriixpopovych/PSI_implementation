import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { staySmartRoutes } from "../lib/routes";

export function AccessDeniedScreen({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const navigate = useNavigate();

  return (
    <section className="grid min-h-[70vh] place-items-center">
      <Card className="w-full max-w-2xl rounded-[2rem] text-center">
        <CardContent className="space-y-6 p-10">
          <div className="mx-auto flex size-20 items-center justify-center rounded-[1.6rem] bg-rose-50 text-rose-600 shadow-[0_18px_42px_rgba(244,63,94,0.12)]">
            <XCircle className="size-9" />
          </div>
          <div className="space-y-3">
            <h2 className="font-display text-5xl font-black tracking-[-0.06em] text-foreground">
              {title}
            </h2>
            <p className="mx-auto max-w-[34ch] text-base leading-8 text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={() => navigate(staySmartRoutes.catalog)}>
              Open catalog
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-[1.2rem] border-white/80 bg-white/78"
              onClick={() => navigate(staySmartRoutes.home)}
            >
              Back home
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
