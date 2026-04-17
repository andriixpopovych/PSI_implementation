import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HousePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/app/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { SectionHeading } from '../components/content-blocks';
import { getMyListings } from '../lib/api';
import { staySmartRoutes } from '../lib/routes';
import { mapObjectToCardView, type PropertyCardView } from '../lib/view-models';

export function HostPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState<PropertyCardView[]>([]);
  const [message, setMessage] = useState('Loading listings...');

  useEffect(() => {
    if (!user) {
      setMessage('Login as host first to show your listings.');
      setListings([]);
      return;
    }

    getMyListings()
      .then((response) => {
        setListings(response.data.map(mapObjectToCardView));
        setMessage(response.data.length === 0 ? 'No listings yet.' : '');
      })
      .catch((error: Error) => {
        setMessage(error.message);
        setListings([]);
      });
  }, [user]);

  return (
    <>
      <SectionHeading
        title="Listed Properties"
        copy="Host dashboard now reads your real backend listings and their approval statuses."
        action={
          <Button onClick={() => navigate(staySmartRoutes.addListing)}>
            <HousePlus className="size-4" />
            Add New
          </Button>
        }
      />

      {message ? <p className="text-muted-foreground">{message}</p> : null}

      <motion.section className="grid gap-6 md:grid-cols-2">
        {listings.map((property) => (
          <motion.div key={property.id} initial={false} whileHover={{ y: -8 }}>
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="relative overflow-hidden rounded-[1.5rem]">
                  <img src={property.image} alt={property.title} className="aspect-[1.15/1] w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute inset-x-5 bottom-5 text-white">
                    <p className="font-display text-3xl font-black tracking-[-0.05em]">{property.title}</p>
                    <p className="mt-2 text-sm text-white/80">{property.address}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/70">{property.badge}</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => navigate(staySmartRoutes.property(property.id))}>
                    Open
                  </Button>
                  <Button variant="ghost" className="flex-1" disabled>
                    {property.status}
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
