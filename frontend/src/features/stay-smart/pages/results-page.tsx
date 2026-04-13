import { motion } from 'framer-motion';

import { Badge } from '@/components/ui/badge';

import { ResultCard, SectionHeading } from '../components/content-blocks';
import { properties } from '../lib/mock-data';
import { itemMotion } from '../lib/motion';
import { staySmartRoutes } from '../lib/routes';

export function ResultsPage() {
  return (
    <>
      <SectionHeading
        title="10 Results Found"
        copy="A quick list of places that match your dates and stay style."
      />

      <motion.section variants={itemMotion} className="flex flex-wrap gap-3">
        <Badge variant="muted">100 Smart Street</Badge>
        <Badge variant="muted">12 Mar 2027</Badge>
        <Badge variant="muted">Short Period</Badge>
      </motion.section>

      <motion.section variants={itemMotion} className="grid gap-6 xl:grid-cols-2">
        {properties.slice(0, 4).map((property, index) => (
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
