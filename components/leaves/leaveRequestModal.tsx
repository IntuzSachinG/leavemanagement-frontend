"use client";

import {  useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";

interface LeaveRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    startDate: string;
    endDate: string;
    reason: string;
  }) => Promise<void>;
}

export function LeaveRequestModal({
  open,
  onClose,
  onSubmit,
}: LeaveRequestModalProps) {
  const [values, setValues] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [isSubmitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit(values);
      setValues({
        startDate: "",
        endDate: "",
        reason: "",
      });
      onClose();
    } catch {
      return;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Apply for leave"
      description="This form maps directly to the backend leave application endpoint."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Start date"
            type="date"
            value={values.startDate}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                startDate: event.target.value,
              }))
            }
            required
          />
          <Input
            label="End date"
            type="date"
            value={values.endDate}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                endDate: event.target.value,
              }))
            }
            required
          />
        </div>
        <Textarea
          label="Reason"
          value={values.reason}
          onChange={(event) =>
            setValues((current) => ({ ...current, reason: event.target.value }))
          }
          placeholder="Describe the leave reason"
          required
        />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit request"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
