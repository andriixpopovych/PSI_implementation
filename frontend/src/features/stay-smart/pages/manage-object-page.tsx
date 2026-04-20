import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useToast } from "@/app/toast-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { SectionHeading } from "../components/content-blocks";
import { getObject, updateObject } from "../lib/api";
import { itemMotion } from "../lib/motion";
import { staySmartRoutes } from "../lib/routes";

export function ManageObjectPage() {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    country: "",
    address: "",
  });

  useEffect(() => {
    if (!propertyId) {
      return;
    }

    setLoading(true);
    getObject(propertyId)
      .then((response) => {
        setForm({
          title: response.data.title,
          description: response.data.description ?? "",
          city: response.data.city,
          country: response.data.country,
          address: response.data.address,
        });
        setMessage(null);
      })
      .catch((error: Error) => {
        setMessage(error.message);
      })
      .finally(() => setLoading(false));
  }, [propertyId]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async () => {
    if (!propertyId) {
      return;
    }

    try {
      setSaving(true);
      await updateObject(propertyId, form);
      showToast({
        variant: "success",
        title: "Object updated",
        description: "Main accommodation details were saved.",
      });
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Failed to update object.";
      setMessage(nextMessage);
      showToast({
        variant: "error",
        title: "Update failed",
        description: nextMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SectionHeading
        title="Manage Object"
        copy="Update the shared object-level information here. Photos and pricing per stay option live in Manage Variants."
        action={
          <Button onClick={() => navigate(staySmartRoutes.manageVariants(propertyId))}>
            <Settings2 className="size-4" />
            Manage Variants
          </Button>
        }
      />

      {loading ? <p className="text-muted-foreground">Loading object...</p> : null}
      {message ? <p className="text-muted-foreground">{message}</p> : null}

      {!loading ? (
        <motion.section variants={itemMotion}>
          <Card className="rounded-[2rem]">
            <CardContent className="space-y-6 p-7 sm:p-8">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-foreground">Title</label>
                  <Input
                    value={form.title}
                    onChange={(event) => updateField("title", event.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-foreground">Address</label>
                  <Input
                    value={form.address}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-foreground">City</label>
                  <Input
                    value={form.city}
                    onChange={(event) => updateField("city", event.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-foreground">Country</label>
                  <Input
                    value={form.country}
                    onChange={(event) =>
                      updateField("country", event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => void submit()} disabled={saving}>
                  {saving ? "Saving..." : "Save Object"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(staySmartRoutes.property(propertyId))}
                >
                  Open Listing
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      ) : null}
    </>
  );
}
