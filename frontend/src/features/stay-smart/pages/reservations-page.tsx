import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ReservationCard, SectionHeading } from '../components/content-blocks';
import { properties, reservations, type ReservationTab } from '../lib/mock-data';
import { itemMotion } from '../lib/motion';

function getReservationTab(searchParams: URLSearchParams): ReservationTab {
  return searchParams.get('tab') === 'past' ? 'past' : 'upcoming';
}

export function ReservationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const activeTab = getReservationTab(searchParams);
  const visibleReservations = reservations.filter((reservation) => reservation.status === activeTab);

  const setActiveTab = (tab: ReservationTab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tab);
    setSearchParams(nextParams, { replace: true });

    if (tab !== 'upcoming') {
      setShowCancelModal(false);
    }
  };

  return (
    <>
      <SectionHeading
        title="Reservations"
        copy="Keep upcoming trips and past stays in one simple place."
      />

      <motion.section variants={itemMotion}>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ReservationTab)} className="w-full">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-5">
            {visibleReservations.map((reservation, index) => {
              const property =
                properties.find((item) => item.id === reservation.propertyId) ?? properties[0];

              return (
                <ReservationCard
                  key={reservation.id}
                  property={property}
                  reservation={reservation}
                  action={
                    <Button
                      variant="secondary"
                      className="w-full lg:w-auto"
                      onClick={() => setShowCancelModal(true)}
                    >
                      Cancel Reservation
                    </Button>
                  }
                  index={index}
                />
              );
            })}
          </TabsContent>

          <TabsContent value="past" className="space-y-5">
            {visibleReservations.map((reservation, index) => {
              const property =
                properties.find((item) => item.id === reservation.propertyId) ?? properties[0];

              return (
                <ReservationCard
                  key={reservation.id}
                  property={property}
                  reservation={reservation}
                  action={
                    <Button variant="ghost" className="w-full lg:w-auto" disabled>
                      Completed
                    </Button>
                  }
                  index={index}
                />
              );
            })}
          </TabsContent>
        </Tabs>
      </motion.section>

      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to cancel reservation?</DialogTitle>
            <DialogDescription>
              If you proceed, a part of the paid price will be kept as a cancellation fee.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" className="w-full" onClick={() => setShowCancelModal(false)}>
              No
            </Button>
            <Button className="w-full" onClick={() => setShowCancelModal(false)}>
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
