import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { itemMotion } from '../lib/motion';
import { staySmartRoutes } from '../lib/routes';

export function SavedPage() {
  const navigate = useNavigate();

  return (
    <motion.section
      variants={itemMotion}
      className="grid min-h-[70vh] place-items-center"
    >
      <Card className="w-full max-w-2xl rounded-[2rem] text-center">
        <CardContent className="space-y-6 p-10">
          <div className="mx-auto flex size-20 items-center justify-center rounded-[1.6rem] bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[0_18px_42px_rgba(89,61,34,0.18)]">
            <CheckCircle2 className="size-8" />
          </div>
          <div className="space-y-3">
            <h2 className="font-display text-5xl font-black tracking-[-0.06em]">
              Thanks, your property is saved!
            </h2>
            <p className="mx-auto max-w-[34ch] text-base leading-8 text-muted-foreground">
              Your listing is saved and ready for the next step.
            </p>
          </div>
          <Button size="lg" onClick={() => navigate(staySmartRoutes.host)}>
            Back to host dashboard
          </Button>
        </CardContent>
      </Card>
    </motion.section>
  );
}
