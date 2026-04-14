"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";

type LeaveFormValues = {
  startDate: string;
  endDate: string;
  reason: string;
};

interface LeaveRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: LeaveFormValues) => Promise<void>;
}

export function LeaveRequestModal({
  open,
  onClose,
  onSubmit,
}: LeaveRequestModalProps) {
  const [values, setValues] = useState<LeaveFormValues>({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [isSubmitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  function validate(values: LeaveFormValues) {
    const errors: {
      startDate?: string;
      endDate?: string;
    } = {};

    const start = values.startDate ? new Date(values.startDate) : null;
    const end = values.endDate ? new Date(values.endDate) : null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start && start < today) {
      errors.startDate = "Cannot apply leave for past dates";
    }

    if (start && end && start > end) {
      errors.endDate = "startDate must be before endDate";
    }

    return errors;
  }

  const isValid =
    !errors.startDate &&
    !errors.endDate &&
    values.startDate &&
    values.endDate &&
    values.reason;

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(values);

      setValues({
        startDate: "",
        endDate: "",
        reason: "",
      });

      setErrors({});
      onClose();
    } catch (err: any) {
      const message = err?.response?.data?.message;

      if (message === "Overlapping leave exists") {
        setErrors({
          endDate: "You already have leave in this date range",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Apply for leave"
      description="Apply Leave Request"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Input
              label="Start date"
              type="date"
              value={values.startDate}
              onChange={(event) => {
                const newValues = {
                  ...values,
                  startDate: event.target.value,
                };

                setValues(newValues);
                setErrors(validate(newValues));
              }}
              required
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm">{errors.startDate}</p>
            )}
          </div>

          <div>
            <Input
              label="End date"
              type="date"
              value={values.endDate}
              onChange={(event) => {
                const newValues = {
                  ...values,
                  endDate: event.target.value,
                };

                setValues(newValues);
                setErrors(validate(newValues));
              }}
              required
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm">{errors.endDate}</p>
            )}
          </div>
        </div>

        <Textarea
          label="Reason"
          value={values.reason}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              reason: event.target.value,
            }))
          }
          placeholder="Describe the leave reason"
          required
        />

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" disabled={isSubmitting || !isValid}>
            {isSubmitting ? "Submitting..." : "Submit request"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
