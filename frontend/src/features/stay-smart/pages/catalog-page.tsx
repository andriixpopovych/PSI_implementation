import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';

import { CatalogFiltersDrawer } from '../components/catalog-filters-drawer';
import { PropertyCard, SectionHeading } from '../components/content-blocks';
import { searchObjects } from '../lib/api';
import { categoryFilters, type CategoryFilter } from '../lib/mock-data';
import { itemMotion } from '../lib/motion';
import { staySmartRoutes } from '../lib/routes';
import { mapObjectToCardView, type PropertyCardView } from '../lib/view-models';

export function CatalogPage() {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>(categoryFilters[0]);
  const [properties, setProperties] = useState<PropertyCardView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    searchObjects({})
      .then((response) => {
        setProperties(response.data.map(mapObjectToCardView));
      })
      .finally(() => setLoading(false));
  }, []);

  const visibleProperties =
    activeFilter === 'More'
      ? properties
      : properties.filter((property) =>
          property.type.toLowerCase().includes(activeFilter.slice(0, -1).toLowerCase()),
        );

  return (
    <>
      <SectionHeading
        title="Catalog"
        copy="Approved backend listings in one clean, photo-led feed."
        action={<CatalogFiltersDrawer />}
      />

      <motion.section variants={itemMotion} className="flex flex-wrap gap-3">
        {categoryFilters.map((filter) => (
          <Button
            key={filter}
            variant={filter === activeFilter ? 'secondary' : 'ghost'}
            className={filter === activeFilter ? 'rounded-full bg-primary/10 text-primary hover:bg-primary/12' : 'rounded-full'}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </Button>
        ))}
      </motion.section>

      <motion.section variants={itemMotion} className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground">Loading catalog from backend...</p>
        ) : (
          visibleProperties.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              to={staySmartRoutes.property(property.id)}
              index={index}
            />
          ))
        )}
      </motion.section>
    </>
  );
}
