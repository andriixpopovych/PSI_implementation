import { useState } from "react";
import { motion } from "framer-motion";
import { HousePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useToast } from "@/app/toast-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { SectionHeading } from "../components/content-blocks";
import { createListing } from "../lib/api";
import { hostTypes, type HostType } from "../lib/mock-data";
import { itemMotion } from "../lib/motion";
import { staySmartRoutes } from "../lib/routes";

const initialForm = {
  title: "Sunny apartment near city center",
  about:
    "Sunny apartment with calm colors, smart storage, quick check-in, and a calm host vibe.",
  city: "Bratislava",
  country: "Slovakia",
  address: "100 Smart Street, Bratislava",
  variantTitle: "Entire apartment",
  guests: "2",
  bedrooms: "1",
  bathrooms: "1",
  pricePerNight: "95",
  pricePerMonth: "1400",
};

const propertyTypeMap: Record<HostType, "APARTMENT" | "ROOM" | "VILLA"> = {
  Apartment: "APARTMENT",
  Flat: "APARTMENT",
  Room: "ROOM",
  Villa: "VILLA",
};

export function AddListingPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeType, setActiveType] = useState<HostType>(hostTypes[0]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState<string | null>(null);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async () => {
    try {
      await createListing({
        title: form.title,
        description: form.about,
        type: propertyTypeMap[activeType],
        city: form.city,
        country: form.country,
        address: form.address,
        initialVariant: {
          title: form.variantTitle,
          type: activeType === "Room" ? "PRIVATE_ROOM" : "ENTIRE_PLACE",
          guests: Number(form.guests),
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          pricePerNight: Number(form.pricePerNight),
          pricePerMonth: Number(form.pricePerMonth),
        },
      });

      showToast({
        variant: "success",
        title: "Listing created",
        description: "Listing was sent for manager review.",
      });

      navigate(staySmartRoutes.saved);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Failed to create listing.";
      setMessage(nextMessage);
      showToast({
        variant: "error",
        title: "Create listing failed",
        description: nextMessage,
      });
    }
  };

  return (
    <>
      <SectionHeading
        title="What kind of place will you host?"
        copy="This form now creates a real backend listing and sends it to manager approval."
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
                    "group flex items-center gap-4 rounded-[1.6rem] border border-transparent bg-white/65 p-4 text-left transition hover:-translate-y-1 hover:shadow-lg",
                    type === activeType && "border-accent/18 bg-accent/8",
                  )}
                >
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-accent">
                    <HousePlus className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{type}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Creates a backend listing
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground">
                  Title
                </label>
                <Input
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground">
                  Variant title
                </label>
                <Input
                  value={form.variantTitle}
                  onChange={(event) =>
                    updateField("variantTitle", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground">About</label>
              <Textarea
                value={form.about}
                onChange={(event) => updateField("about", event.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground">
                  City
                </label>
                <Input
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground">
                  Country
                </label>
                <Input
                  value={form.country}
                  onChange={(event) =>
                    updateField("country", event.target.value)
                  }
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground">
                  Address
                </label>
                <Input
                  value={form.address}
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Input
                value={form.guests}
                onChange={(event) => updateField("guests", event.target.value)}
              />
              <Input
                value={form.bedrooms}
                onChange={(event) =>
                  updateField("bedrooms", event.target.value)
                }
              />
              <Input
                value={form.bathrooms}
                onChange={(event) =>
                  updateField("bathrooms", event.target.value)
                }
              />
              <Input
                value={form.pricePerNight}
                onChange={(event) =>
                  updateField("pricePerNight", event.target.value)
                }
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground">
                Price per month
              </label>
              <Input
                value={form.pricePerMonth}
                onChange={(event) =>
                  updateField("pricePerMonth", event.target.value)
                }
              />
            </div>

            <Button size="lg" onClick={() => void submit()}>
              Save listing
            </Button>

            {message ? (
              <p className="text-sm text-muted-foreground">{message}</p>
            ) : null}
          </CardContent>
        </Card>
      </motion.section>
    </>
  );
}
