import { useState } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { PropertyCard, SectionHeading } from '../components/content-blocks';
import {
  categoryFilters,
  properties,
  type CategoryFilter,
} from '../lib/mock-data';
import { itemMotion } from '../lib/motion';
import { staySmartRoutes } from '../lib/routes';

export function CatalogPage() {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>(categoryFilters[0]);

  return (
    <>
      <SectionHeading
        title="Catalog"
        copy="Browse every category in one clean, photo-led feed."
        action={
          <Button variant="outline" className="rounded-[1.15rem] border-white/80 bg-white/70">
            <SlidersHorizontal className="size-4" />
            Filters
          </Button>
        }
      />

      <motion.section variants={itemMotion} className="flex flex-wrap gap-3">
        {categoryFilters.map((filter) => (
          <Button
            key={filter}
            variant={filter === activeFilter ? 'secondary' : 'ghost'}
            className={cn(
              'rounded-full',
              filter === activeFilter && 'bg-primary/10 text-primary hover:bg-primary/12',
            )}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </Button>
        ))}
      </motion.section>

      <motion.section variants={itemMotion} className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {properties.map((property, index) => (
          <PropertyCard
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
