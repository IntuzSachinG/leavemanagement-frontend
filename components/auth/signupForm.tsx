"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getPublicDepartments } from "@/lib/api/services";
import { Department } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/contexts/authContext";
import { roleDefaultRoute } from "@/lib/constants/navigation";

type SignupValues = {
  name: string;
  email: string;
  password: string;
  gender: "male" | "female" | "other";
  mobile: string;
  departmentId: string;
};

export function SignupForm() {
  const router = useRouter();
  const { signup } = useAuth();
  const [isSubmitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [values, setValues] = useState<SignupValues>({
    name: "",
    email: "",
    password: "",
    gender: "male" as const,
    mobile: "",
    departmentId: "",
  });

  useEffect(() => {
    getPublicDepartments()
      .then((response) => setDepartments(response.data))
      .catch(() => {
        toast.error(
          "Do not load departments an unexpected error occurred on our end. Please try again later",
        );
      });
  }, []);

 

  // async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
  //   event.preventDefault();
  //   setSubmitting(true);

  //   try {
  //     await signup(values);
  //     toast.success("Signup successfully");
  //     router.push("/login");
  //   } catch (error) {
  //     toast.error(
  //       error instanceof Error ? error.message : "Unable to create account.",
  //     );
  //   } finally {
  //     setSubmitting(false);
  //   }
  // }


  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
  event.preventDefault();
  setSubmitting(true);

  try {
    const user = await signup(values); 

    toast.success("Signup successfully");

    router.push(roleDefaultRoute[user.role]); 
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : "Unable to create account.",
    );
  } finally {
    setSubmitting(false);
  }
}

  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
      <Input
        label="Full Name"
        placeholder="Aarav Sharma"
        value={values.name}
        onChange={(event) =>
          setValues((current) => ({ ...current, name: event.target.value }))
        }
        required
      />
      <Input
        label="Email"
        type="email"
        placeholder="aarav@company.com"
        value={values.email}
        onChange={(event) =>
          setValues((current) => ({ ...current, email: event.target.value }))
        }
        required
      />
      <Input
        label="Password"
        type="password"
        placeholder="Minimum 6 characters"
        value={values.password}
        onChange={(event) =>
          setValues((current) => ({ ...current, password: event.target.value }))
        }
        required
      />
      <Input
        label="Mobile"
        placeholder="+919999999999"
        value={values.mobile}
        onChange={(event) =>
          setValues((current) => ({ ...current, mobile: event.target.value }))
        }
      />
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
      >
        <option value="">Select department</option>
        {departments.map((department) => (
          <option key={department.id} value={department.id}>
            {department.name}
          </option>
        ))}
      </Select>
      <div className="md:col-span-2">
        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </div>
    </form>
  );
}
