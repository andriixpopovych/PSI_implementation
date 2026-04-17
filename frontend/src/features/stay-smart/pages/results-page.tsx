import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';

import { ResultCard, SectionHeading } from '../components/content-blocks';
import { searchObjects } from '../lib/api';
import { itemMotion } from '../lib/motion';
import { staySmartRoutes } from '../lib/routes';
import { mapObjectToCardView, type PropertyCardView } from '../lib/view-models';

export function ResultsPage() {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<PropertyCardView[]>([]);

  const city = searchParams.get('city') ?? '';
  const guests = searchParams.get('guests') ?? '';
  const checkIn = searchParams.get('checkIn') ?? '';
  const checkOut = searchParams.get('checkOut') ?? '';

  useEffect(() => {
    searchObjects({
      city,
      guests: guests ? Number(guests) : undefined,
    })
      .then((response) => {
        setProperties(response.data.map(mapObjectToCardView));
      })
      .catch(() => {
        setProperties([]);
      });
  }, [city, guests]);

  return (
    <>
      <SectionHeading
        title={`${properties.length} Results Found`}
        copy="Live search results coming from the backend search endpoint."
      />

      <motion.section variants={itemMotion} className="flex flex-wrap gap-3">
        {city ? <Badge variant="muted">{city}</Badge> : null}
        {checkIn ? <Badge variant="muted">{checkIn}</Badge> : null}
        {checkOut ? <Badge variant="muted">{checkOut}</Badge> : null}
        {guests ? <Badge variant="muted">{guests} guests</Badge> : null}
      </motion.section>

      <motion.section variants={itemMotion} className="grid gap-6 xl:grid-cols-2">
        {properties.map((property, index) => (
          <ResultCard
            key={property.id}
            property={property}
            to={staySmartRoutes.property(property.id)}
            index={index}
          />
        ))}
      </motion.section>
    </>
  );
}
