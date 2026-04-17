import { useEffect, useState } from "react";

import { useAuth } from "@/app/auth-context";
import { useToast } from "@/app/toast-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { SectionHeading } from "../components/content-blocks";
import { getListingsForReview, reviewListing } from "../lib/api";
import type { ApiObject } from "../lib/api-types";
import { mapObjectToCardView } from "../lib/view-models";

export function ManagerPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [objects, setObjects] = useState<ApiObject[]>([]);
  const [message, setMessage] = useState("Loading review queue...");

  const load = () => {
    getListingsForReview("PENDING")
      .then((response) => {
        setObjects(response.data);
        setMessage(response.data.length === 0 ? "No pending listings." : "");
      })
      .catch((error: Error) => {
        setMessage(error.message);
      });
  };

  useEffect(() => {
    if (!user) {
      setMessage("Login as manager first to moderate listings.");
      return;
    }

    load();
  }, [user]);

  const moderate = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await reviewListing(id, status);
      load();
      setMessage(
        status === "APPROVED" ? "Listing approved." : "Listing rejected.",
      );
      showToast({
        variant: "success",
        title: status === "APPROVED" ? "Listing approved" : "Listing rejected",
      });
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Moderation failed.";
      setMessage(nextMessage);
      showToast({
        variant: "error",
        title: "Moderation failed",
        description: nextMessage,
      });
    }
  };

  return (
    <>
      <SectionHeading
        title="Manager Review"
        copy="Pending host listings can be approved here for the public catalog."
      />

      {message ? <p className="text-muted-foreground">{message}</p> : null}

      <section className="grid gap-6">
        {objects.map((object) => {
          const property = mapObjectToCardView(object);

          return (
            <Card key={object.id}>
              <CardHeader>
                <CardTitle>{property.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-7 text-muted-foreground">
                  {property.address}
                </p>
                <p className="text-sm leading-7 text-muted-foreground">
                  {property.description}
                </p>
                <p className="text-sm leading-7 text-muted-foreground">
                  Host: {property.host}. Variant count:{" "}
                  {property.variants.length}.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => void moderate(object.id, "APPROVED")}>
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void moderate(object.id, "REJECTED")}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </>
  );
}
