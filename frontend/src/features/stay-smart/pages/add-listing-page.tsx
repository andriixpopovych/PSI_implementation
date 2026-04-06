import { useState } from 'react';
import { motion } from 'framer-motion';
import { HousePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { SectionHeading } from '../components/content-blocks';
import { hostTypes, type HostType } from '../lib/mock-data';
import { itemMotion } from '../lib/motion';
import { staySmartRoutes } from '../lib/routes';

const initialForm = {
  about: 'Sunny apartment with calm colors, smart storage, quick check-in, and a calm host vibe.',
  location: '100 Smart Street, Los Angeles',
  contact: 'host@staysmart.app',
};

export function AddListingPage() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState<HostType>(hostTypes[0]);
  const [form, setForm] = useState(initialForm);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <>
      <SectionHeading
        title="What kind of place will you host?"
        copy="Start with the space type, then add the core details guests need first."
      />

      <motion.section variants={itemMotion}>
        <Card className="rounded-[2rem]">
          <CardContent className="space-y-8 p-7 sm:p-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {hostTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveType(type)}
                  className={cn(
                    'group flex items-center gap-4 rounded-[1.6rem] border border-transparent bg-white/65 p-4 text-left transition hover:-translate-y-1 hover:shadow-lg',
                    type === activeType && 'border-accent/18 bg-accent/8',
                  )}
                >
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-accent">
                    <HousePlus className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{type}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Static selection for now</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground">About</label>
              <Textarea
                value={form.about}
                onChange={(event) => updateField('about', event.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground">Location</label>
                <Input
                  value={form.location}
                  onChange={(event) => updateField('location', event.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground">Contact</label>
                <Input
                  value={form.contact}
                  onChange={(event) => updateField('contact', event.target.value)}
                />
              </div>
            </div>

            <Button size="lg" onClick={() => navigate(staySmartRoutes.saved)}>
              Save listing
            </Button>
          </CardContent>
        </Card>
      </motion.section>
    </>
  );
}
