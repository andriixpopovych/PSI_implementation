import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "@/app/auth-context";
import { useToast } from "@/app/toast-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ReservationCard, SectionHeading } from "../components/content-blocks";
import {
  cancelReservation,
  getMyReservations,
  searchObjects,
} from "../lib/api";
import { itemMotion } from "../lib/motion";
import {
  mapObjectToCardView,
  mapReservationToCardView,
  type PropertyCardView,
  type ReservationCardView,
} from "../lib/view-models";

function getReservationTab(searchParams: URLSearchParams): "upcoming" | "past" {
  return searchParams.get("tab") === "past" ? "past" : "upcoming";
}

export function ReservationsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<
    string | null
  >(null);
  const [properties, setProperties] = useState<PropertyCardView[]>([]);
  const [reservations, setReservations] = useState<ReservationCardView[]>([]);
  const [message, setMessage] = useState("Loading reservations...");
  const activeTab = getReservationTab(searchParams);
  const visibleReservations = reservations.filter(
    (reservation) => reservation.status === activeTab,
  );

  useEffect(() => {
    if (!user) {
      setMessage("Login as guest first to show reservations.");
      setReservations([]);
      return;
    }

    Promise.all([getMyReservations(), searchObjects({})])
      .then(([reservationResponse, objectResponse]) => {
        const objectCards = objectResponse.data.map(mapObjectToCardView);
        setProperties(objectCards);
        setReservations(
          reservationResponse.data.map((reservation) =>
            mapReservationToCardView(reservation, objectResponse.data),
          ),
        );
        setMessage(
          reservationResponse.data.length === 0 ? "No reservations yet." : "",
        );
      })
      .catch((error: Error) => {
        setMessage(error.message);
      });
  }, [user]);

  const setActiveTab = (tab: "upcoming" | "past") => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", tab);
    setSearchParams(nextParams, { replace: true });
  };

  const confirmCancel = async () => {
    if (!selectedReservationId) {
      return;
    }

    try {
      await cancelReservation(selectedReservationId, "Canceled during demo");
      setReservations((current) =>
        current.map((reservation) =>
          reservation.id === selectedReservationId
            ? { ...reservation, status: "past", apiStatus: "CANCELED" }
            : reservation,
        ),
      );
      setMessage("Reservation canceled.");
      showToast({
        variant: "success",
        title: "Reservation canceled",
      });
    } catch (error) {
      const nextMessage =
        error instanceof Error
          ? error.message
          : "Failed to cancel reservation.";
      setMessage(nextMessage);
      showToast({
        variant: "error",
        title: "Cancel failed",
        description: nextMessage,
      });
    } finally {
      setShowCancelModal(false);
      setSelectedReservationId(null);
    }
  };

  return (
    <>
      <SectionHeading
        title="Reservations"
        copy="Upcoming and past stays now come from the authenticated backend session."
      />

      {message ? <p className="text-muted-foreground">{message}</p> : null}

      <motion.section variants={itemMotion}>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "upcoming" | "past")}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-5">
            {visibleReservations.map((reservation, index) => {
              const property =
                properties.find((item) => item.id === reservation.propertyId) ??
                properties[0];

              return property ? (
                <ReservationCard
                  key={reservation.id}
                  property={property}
                  reservation={reservation}
                  action={
                    <Button
                      variant="secondary"
                      className="w-full lg:w-auto"
                      onClick={() => {
                        setSelectedReservationId(reservation.id);
                        setShowCancelModal(true);
                      }}
                    >
                      Cancel Reservation
                    </Button>
                  }
                  index={index}
                />
              ) : null;
            })}
          </TabsContent>

          <TabsContent value="past" className="space-y-5">
            {visibleReservations.map((reservation, index) => {
              const property =
                properties.find((item) => item.id === reservation.propertyId) ??
                properties[0];

              return property ? (
                <ReservationCard
                  key={reservation.id}
                  property={property}
                  reservation={reservation}
                  action={
                    <Button
                      variant="ghost"
                      className="w-full lg:w-auto"
                      disabled
                    >
                      {reservation.apiStatus}
                    </Button>
                  }
                  index={index}
                />
              ) : null;
            })}
          </TabsContent>
        </Tabs>
      </motion.section>

      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to cancel reservation?
            </DialogTitle>
            <DialogDescription>
              This calls the backend cancel endpoint and moves the reservation
              to the past tab.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setShowCancelModal(false)}
            >
              No
            </Button>
            <Button className="w-full" onClick={() => void confirmCancel()}>
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
