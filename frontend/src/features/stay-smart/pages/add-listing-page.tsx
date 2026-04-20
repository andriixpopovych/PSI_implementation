import { useState } from "react";
import { motion } from "framer-motion";
import { HousePlus, ImagePlus, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useToast } from "@/app/toast-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { SmartImage } from "../components/smart-image";
import { SectionHeading } from "../components/content-blocks";
import { createListing } from "../lib/api";
import { getDemoImageFallback } from "../lib/media";
import { hostTypes, type HostType } from "../lib/mock-data";
import { itemMotion } from "../lib/motion";
import { staySmartRoutes } from "../lib/routes";

type VariantForm = {
  title: string;
  photoUrl: string;
  guests: string;
  bedrooms: string;
  bathrooms: string;
  pricePerNight: string;
  pricePerMonth: string;
};

const initialForm = {
  title: "Sunny apartment near city center",
  about:
    "Sunny apartment with calm colors, smart storage, quick check-in, and a calm host vibe.",
  city: "Bratislava",
  country: "Slovakia",
  address: "100 Smart Street, Bratislava",
};

const initialVariant: VariantForm = {
  title: "Entire apartment",
  photoUrl:
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80",
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

function variantTypeForHostType(
  type: HostType,
): "ENTIRE_PLACE" | "PRIVATE_ROOM" {
  return type === "Room" ? "PRIVATE_ROOM" : "ENTIRE_PLACE";
}

function createEmptyVariant(index: number): VariantForm {
  return {
    ...initialVariant,
    title: `Variant ${index + 1}`,
  };
}

export function AddListingPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeType, setActiveType] = useState<HostType>(hostTypes[0]);
  const [form, setForm] = useState(initialForm);
  const [variants, setVariants] = useState<VariantForm[]>([initialVariant]);
  const [message, setMessage] = useState<string | null>(null);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateVariantField = (
    index: number,
    field: keyof VariantForm,
    value: string,
  ) => {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant,
      ),
    );
  };

  const addVariant = () => {
    setVariants((current) => [...current, createEmptyVariant(current.length)]);
  };

  const removeVariant = (index: number) => {
    setVariants((current) =>
      current.length === 1
        ? current
        : current.filter((_, variantIndex) => variantIndex !== index),
    );
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
        variants: variants.map((variant) => ({
          title: variant.title,
          photoUrl: variant.photoUrl || undefined,
          type: variantTypeForHostType(activeType),
          guests: Number(variant.guests),
          bedrooms: Number(variant.bedrooms),
          bathrooms: Number(variant.bathrooms),
          pricePerNight: Number(variant.pricePerNight),
          pricePerMonth: Number(variant.pricePerMonth),
        })),
      });

      showToast({
        variant: "success",
        title: "Listing created",
        description: "Listing with variants was sent for manager review.",
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
        copy="Create the accommodation object once, then define the actual placement variants with their own photos and pricing."
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
                      Object type
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

            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground">About</label>
              <Textarea
                value={form.about}
                onChange={(event) => updateField("about", event.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-foreground">
                    Placement variants
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Every variant gets its own pricing, capacity and photo.
                  </p>
                </div>
                <Button variant="outline" onClick={addVariant}>
                  <Plus className="size-4" />
                  Add variant
                </Button>
              </div>

              <div className="grid gap-5">
                {variants.map((variant, index) => (
                  <div
                    key={`${index}-${variant.title}`}
                    className="rounded-[1.8rem] border border-white/80 bg-white/68 p-5 shadow-[0_14px_34px_rgba(89,61,34,0.06)]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-base font-bold text-foreground">
                          Variant {index + 1}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          This will be shown as a separate stay option.
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => removeVariant(index)}
                        disabled={variants.length === 1}
                      >
                        <Trash2 className="size-4" />
                        Remove
                      </Button>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-foreground">
                          Variant title
                        </label>
                        <Input
                          value={variant.title}
                          onChange={(event) =>
                            updateVariantField(
                              index,
                              "title",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-foreground">
                          Photo URL
                        </label>
                        <Input
                          value={variant.photoUrl}
                          onChange={(event) =>
                            updateVariantField(
                              index,
                              "photoUrl",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-4">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-foreground">
                          Guests
                        </label>
                        <Input
                          value={variant.guests}
                          onChange={(event) =>
                            updateVariantField(index, "guests", event.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-foreground">
                          Bedrooms
                        </label>
                        <Input
                          value={variant.bedrooms}
                          onChange={(event) =>
                            updateVariantField(
                              index,
                              "bedrooms",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-foreground">
                          Bathrooms
                        </label>
                        <Input
                          value={variant.bathrooms}
                          onChange={(event) =>
                            updateVariantField(
                              index,
                              "bathrooms",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-foreground">
                          Per night
                        </label>
                        <Input
                          value={variant.pricePerNight}
                          onChange={(event) =>
                            updateVariantField(
                              index,
                              "pricePerNight",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-foreground">
                          Per month
                        </label>
                        <Input
                          value={variant.pricePerMonth}
                          onChange={(event) =>
                            updateVariantField(
                              index,
                              "pricePerMonth",
                              event.target.value,
                            )
                          }
                        />
                      </div>

                      <div className="overflow-hidden rounded-[1.4rem] border border-white/80 bg-[rgba(255,252,248,0.86)]">
                        {variant.photoUrl ? (
                          <SmartImage
                            src={variant.photoUrl}
                            alt={variant.title}
                            fallbackSrc={getDemoImageFallback(index)}
                            className="h-44 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-44 items-center justify-center gap-3 text-sm font-semibold text-muted-foreground">
                            <ImagePlus className="size-5" />
                            Add a photo for this variant
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
