"use client";

import { useEffect, useState } from "react";
import { Department } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

interface DepartmentFormModalProps {
  open: boolean;
  department?: Department | null;
  onClose: () => void;
  onSubmit: (payload: { name: string }) => Promise<void>;
   
}

export function DepartmentFormModal({
  open,
  department,
  onClose,
  onSubmit,
}: DepartmentFormModalProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    setName(department?.name ?? "");
  }, [department, open]);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit({ name });
      onClose();
    } catch{
      return;
    }finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={department ? "Edit department" : "Add department"}
      description="Add Departments"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          label="Department name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : department
                ? "Update department"
                : "Create department"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
