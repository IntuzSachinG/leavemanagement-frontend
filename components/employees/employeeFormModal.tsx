"use client";

import {  useEffect, useState } from "react";
import { Department, Employee, Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";

export type EmployeeFormValue = {
  name: string;
  email: string;
  password: string;
  role: Role;
  gender: "male" | "female" | "other";
  mobile: string;
  departmentId: string;
  status: "active" | "inactive";
};

interface EmployeeFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  departments: Department[];
  employee?: Employee | null;
  roleOptions?: Role[];
  departmentOptions?: Department[];
  lockRole?: Role;
  lockDepartmentId?: string;
  managerMode?: boolean;
  managerDepartmentId?: string;
  showStatus?: boolean;
  onClose: () => void;
  onSubmit: (values: EmployeeFormValue) => Promise<void>;
}

function getInitialValues(
  employee?: Employee | null,
  lockRole?: Role,
  lockDepartmentId?: string,
): EmployeeFormValue {
  return {
    name: employee?.name ?? "",
    email: employee?.email ?? "",
    password: "",
    role: lockRole ?? employee?.role ?? "employee",
    gender: employee?.gender ?? "male",
    mobile: employee?.mobile ?? "",
    departmentId: lockDepartmentId ?? employee?.departmentId ?? "",
    status: employee?.status ?? "active",
  };
}

export function EmployeeFormModal({
  open,
  mode,
  departments,
  employee,
  roleOptions = ["admin", "manager", "employee"],
  departmentOptions,
  lockRole,

  lockDepartmentId,
  showStatus = true,
  onClose,
  onSubmit,
}: EmployeeFormModalProps) {
  const availableDepartments = departmentOptions ?? departments;
  const [values, setValues] = useState<EmployeeFormValue>(
    getInitialValues(employee, lockRole, lockDepartmentId),
  );
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValues(getInitialValues(employee, lockRole, lockDepartmentId));
  }, [employee, lockDepartmentId, lockRole, open]);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit(values);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Add employee" : "Edit employee"}
      description="Keep employee records clean and separated from the page layout."
    >
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <Input
          label="Name"
          value={values.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
          required
        />
        <Input
          label="Email"
          type="email"
          value={values.email}
          onChange={(event) =>
            setValues((current) => ({ ...current, email: event.target.value }))
          }
          required
        />
        <Input
          label={mode === "create" ? "Password" : "Password (optional)"}
          type="password"
          value={values.password}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              password: event.target.value,
            }))
          }
          required={mode === "create"}
        />
        <Input
          label="Mobile"
          value={values.mobile}
          onChange={(event) =>
            setValues((current) => ({ ...current, mobile: event.target.value }))
          }
        />
        <Select
          label="Role"
          value={values.role}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              role: event.target.value as Role,
            }))
          }
          disabled={Boolean(lockRole)}
        >
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </Select>
        <Select
          label="Gender"
          value={values.gender}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              gender: event.target.value as "male" | "female" | "other",
            }))
          }
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </Select>
        <Select
          label="Department"
          value={values.departmentId}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              departmentId: event.target.value,
            }))
          }
          required
          disabled={Boolean(lockDepartmentId)}
        >
          <option value="">Select department</option>
          {availableDepartments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </Select>
        {showStatus ? (
          <Select
            label="Status"
            value={values.status}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                status: event.target.value as "active" | "inactive",
              }))
            }
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        ) : null}
        <div className="flex gap-3 md:col-span-2 md:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : mode === "create"
                ? "Create employee"
                : "Update employee"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
