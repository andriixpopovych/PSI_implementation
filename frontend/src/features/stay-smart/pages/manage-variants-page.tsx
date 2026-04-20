import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useToast } from "@/app/toast-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { SmartImage } from "../components/smart-image";
import { SectionHeading } from "../components/content-blocks";
import {
  createObjectVariant,
  deleteObjectVariant,
  getObject,
  updateObjectVariant,
} from "../lib/api";
import type { ApiVariant } from "../lib/api-types";
import { getDemoImageFallback } from "../lib/media";
import { itemMotion } from "../lib/motion";
import { staySmartRoutes } from "../lib/routes";

type VariantForm = {
  id?: string;
  title: string;
  photoUrl: string;
  type: ApiVariant["type"];
  guests: string;
  bedrooms: string;
  bathrooms: string;
  pricePerNight: string;
  pricePerMonth: string;
  isActive: boolean;
};

const emptyVariant: VariantForm = {
  title: "New variant",
  photoUrl: "",
  type: "ENTIRE_PLACE",
  guests: "2",
  bedrooms: "1",
  bathrooms: "1",
  pricePerNight: "100",
  pricePerMonth: "1600",
  isActive: true,
};

function mapVariantToForm(variant: ApiVariant): VariantForm {
  return {
    id: variant.id,
    title: variant.title,
    photoUrl: variant.photoUrl ?? "",
    type: variant.type,
    guests: String(variant.guests),
    bedrooms: String(variant.bedrooms),
    bathrooms: String(variant.bathrooms),
    pricePerNight: String(variant.pricePerNight),
    pricePerMonth: String(variant.pricePerMonth ?? ""),
    isActive: variant.isActive,
  };
}

export function ManageVariantsPage() {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [propertyTitle, setPropertyTitle] = useState("Placement variants");
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [newVariant, setNewVariant] = useState<VariantForm>(emptyVariant);

  useEffect(() => {
    if (!propertyId) {
      return;
    }

    setLoading(true);
    getObject(propertyId)
      .then((response) => {
        setPropertyTitle(response.data.title);
        setVariants(response.data.variants.map(mapVariantToForm));
        setMessage(null);
      })
      .catch((error: Error) => {
        setMessage(error.message);
      })
      .finally(() => setLoading(false));
  }, [propertyId]);

  const updateVariantField = (
    variantId: string,
    field: keyof VariantForm,
    value: string | boolean,
  ) => {
    setVariants((current) =>
      current.map((variant) =>
        variant.id === variantId ? { ...variant, [field]: value } : variant,
      ),
    );
  };

  const updateNewVariantField = (
    field: keyof VariantForm,
    value: string | boolean,
  ) => {
    setNewVariant((current) => ({ ...current, [field]: value }));
  };

  const saveVariant = async (variant: VariantForm) => {
    if (!propertyId || !variant.id) {
      return;
    }

    try {
      setSavingId(variant.id);
      const response = await updateObjectVariant(propertyId, variant.id, {
        title: variant.title,
        photoUrl: variant.photoUrl || undefined,
        type: variant.type,
        guests: Number(variant.guests),
        bedrooms: Number(variant.bedrooms),
        bathrooms: Number(variant.bathrooms),
        pricePerNight: Number(variant.pricePerNight),
        pricePerMonth: variant.pricePerMonth ? Number(variant.pricePerMonth) : undefined,
        isActive: variant.isActive,
      });

      setVariants((current) =>
        current.map((item) =>
          item.id === variant.id ? mapVariantToForm(response.data) : item,
        ),
      );
      showToast({
        variant: "success",
        title: "Variant updated",
        description: `${variant.title} was saved.`,
      });
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Failed to update variant.";
      setMessage(nextMessage);
      showToast({
        variant: "error",
        title: "Variant update failed",
        description: nextMessage,
      });
    } finally {
      setSavingId(null);
    }
  };

  const addVariant = async () => {
    if (!propertyId) {
      return;
    }

    try {
      setSavingId("new");
      const response = await createObjectVariant(propertyId, {
        title: newVariant.title,
        photoUrl: newVariant.photoUrl || undefined,
        type: newVariant.type,
        guests: Number(newVariant.guests),
        bedrooms: Number(newVariant.bedrooms),
        bathrooms: Number(newVariant.bathrooms),
        pricePerNight: Number(newVariant.pricePerNight),
        pricePerMonth: newVariant.pricePerMonth
          ? Number(newVariant.pricePerMonth)
          : undefined,
        isActive: newVariant.isActive,
      });

      setVariants((current) => [...current, mapVariantToForm(response.data)]);
      setNewVariant(emptyVariant);
      showToast({
        variant: "success",
        title: "Variant created",
        description: `${response.data.title} was added to the object.`,
      });
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Failed to create variant.";
      setMessage(nextMessage);
      showToast({
        variant: "error",
        title: "Create variant failed",
        description: nextMessage,
      });
    } finally {
      setSavingId(null);
    }
  };

  const removeVariant = async (variant: VariantForm) => {
    if (!propertyId || !variant.id) {
      return;
    }

    try {
      setSavingId(variant.id);
      await deleteObjectVariant(propertyId, variant.id);
      setVariants((current) => current.filter((item) => item.id !== variant.id));
      showToast({
        variant: "success",
        title: "Variant removed",
        description: `${variant.title} was removed.`,
      });
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Failed to delete variant.";
      setMessage(nextMessage);
      showToast({
        variant: "error",
        title: "Delete failed",
        description: nextMessage,
      });
    } finally {
      setSavingId(null);
    }
  };

  const variantTypeOptions: ApiVariant["type"][] = [
    "ENTIRE_PLACE",
    "PRIVATE_ROOM",
    "SHARED_ROOM",
    "STUDIO",
  ];

  return (
    <>
      <SectionHeading
        title="Manage Variants"
        copy={`Every stay option inside "${propertyTitle}" can have its own title, photo, capacity and pricing.`}
        action={
          <Button onClick={() => navigate(staySmartRoutes.manageObject(propertyId))}>
            Back To Object
          </Button>
        }
      />

      {loading ? <p className="text-muted-foreground">Loading variants...</p> : null}
      {message ? <p className="text-muted-foreground">{message}</p> : null}

      {!loading ? (
        <motion.section variants={itemMotion} className="space-y-6">
          {variants.map((variant) => (
            <VariantEditorCard
              key={variant.id}
              variant={variant}
              saving={savingId === variant.id}
              onFieldChange={updateVariantField}
              onSave={saveVariant}
              onDelete={removeVariant}
              variantTypeOptions={variantTypeOptions}
            />
          ))}

          <Card className="rounded-[2rem] border-dashed">
            <CardContent className="space-y-5 p-7 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Plus className="size-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">Add variant</p>
                  <p className="text-sm text-muted-foreground">
                    Create another stay option for this object.
                  </p>
                </div>
              </div>

              <VariantFields
                variant={newVariant}
                onFieldChange={(field, value) =>
                  updateNewVariantField(field, value)
                }
                variantTypeOptions={variantTypeOptions}
              />

              <Button onClick={() => void addVariant()} disabled={savingId === "new"}>
                {savingId === "new" ? "Creating..." : "Create Variant"}
              </Button>
            </CardContent>
          </Card>
        </motion.section>
      ) : null}
    </>
  );
}

function VariantEditorCard({
  variant,
  saving,
  onFieldChange,
  onSave,
  onDelete,
  variantTypeOptions,
}: {
  variant: VariantForm;
  saving: boolean;
  onFieldChange: (
    variantId: string,
    field: keyof VariantForm,
    value: string | boolean,
  ) => void;
  onSave: (variant: VariantForm) => Promise<void>;
  onDelete: (variant: VariantForm) => Promise<void>;
  variantTypeOptions: ApiVariant["type"][];
}) {
  if (!variant.id) {
    return null;
  }

  return (
    <Card className="rounded-[2rem]">
      <CardContent className="space-y-5 p-7 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-foreground">{variant.title}</p>
            <p className="text-sm text-muted-foreground">
              Save changes per variant or remove it from the object.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => void onSave(variant)} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="ghost" onClick={() => void onDelete(variant)} disabled={saving}>
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
        </div>

        <VariantFields
          variant={variant}
          onFieldChange={(field, value) => onFieldChange(variant.id!, field, value)}
          variantTypeOptions={variantTypeOptions}
        />
      </CardContent>
    </Card>
  );
}

function VariantFields({
  variant,
  onFieldChange,
  variantTypeOptions,
}: {
  variant: VariantForm;
  onFieldChange: (field: keyof VariantForm, value: string | boolean) => void;
  variantTypeOptions: ApiVariant["type"][];
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground">Title</label>
          <Input
            value={variant.title}
            onChange={(event) => onFieldChange("title", event.target.value)}
          />
        </div>
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground">Photo URL</label>
          <Input
            value={variant.photoUrl}
            onChange={(event) => onFieldChange("photoUrl", event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground">Type</label>
          <select
            value={variant.type}
            onChange={(event) => onFieldChange("type", event.target.value)}
            className="h-12 w-full rounded-[1rem] border border-border bg-white/80 px-4 text-sm font-medium text-foreground outline-none"
          >
            {variantTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <NumberField
          label="Guests"
          value={variant.guests}
          onChange={(value) => onFieldChange("guests", value)}
        />
        <NumberField
          label="Bedrooms"
          value={variant.bedrooms}
          onChange={(value) => onFieldChange("bedrooms", value)}
        />
        <NumberField
          label="Bathrooms"
          value={variant.bathrooms}
          onChange={(value) => onFieldChange("bathrooms", value)}
        />
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground">Active</label>
          <label className="flex h-12 items-center gap-3 rounded-[1rem] border border-border bg-white/80 px-4 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={variant.isActive}
              onChange={(event) => onFieldChange("isActive", event.target.checked)}
            />
            Visible in approved listing
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_220px_minmax(0,1fr)]">
        <NumberField
          label="Per Night"
          value={variant.pricePerNight}
          onChange={(value) => onFieldChange("pricePerNight", value)}
        />
        <NumberField
          label="Per Month"
          value={variant.pricePerMonth}
          onChange={(value) => onFieldChange("pricePerMonth", value)}
        />
        <div className="overflow-hidden rounded-[1.4rem] border border-white/80 bg-[rgba(255,252,248,0.86)]">
          {variant.photoUrl ? (
            <SmartImage
              src={variant.photoUrl}
              alt={variant.title}
              fallbackSrc={getDemoImageFallback(0)}
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
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-foreground">{label}</label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
