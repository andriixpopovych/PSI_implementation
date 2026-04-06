import { motion } from 'framer-motion';
import { HousePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { SectionHeading } from '../components/content-blocks';
import { properties } from '../lib/mock-data';
import { staySmartRoutes } from '../lib/routes';

const hostListings = properties.slice(0, 2);

export function HostPage() {
  const navigate = useNavigate();

  return (
    <>
      <SectionHeading
        title="Listed Properties"
        copy="A simple host space for keeping listings tidy and easy to manage."
        action={
          <Button onClick={() => navigate(staySmartRoutes.addListing)}>
            <HousePlus className="size-4" />
            Add New
          </Button>
        }
      />

      <motion.section className="grid gap-6 md:grid-cols-2">
        {hostListings.map((property, index) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -8 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="relative overflow-hidden rounded-[1.5rem]">
                  <img src={property.image} alt={property.title} className="aspect-[1.15/1] w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute inset-x-5 bottom-5 text-white">
                    <p className="font-display text-3xl font-black tracking-[-0.05em]">{property.title}</p>
                    <p className="mt-2 text-sm text-white/80">{property.address}</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Button variant="secondary" className="flex-1">
                    Modify
                  </Button>
                  <Button variant="ghost" className="flex-1">
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.section>
    </>
  );
}
