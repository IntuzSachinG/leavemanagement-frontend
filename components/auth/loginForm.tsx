"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/authContext";
import { roleDefaultRoute } from "@/lib/constants/navigation";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

 

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const user = await login(values);
      toast.success("Login successfully.");
      router.push(roleDefaultRoute[user.role]);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred on our end. Please try again later",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Input
        label="Email"
        type="email"
        placeholder="abc@company.com"
        value={values.email}
        onChange={(event) =>
          setValues((current) => ({ ...current, email: event.target.value }))
        }
        required
      />
      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={values.password}
        onChange={(event) =>
          setValues((current) => ({ ...current, password: event.target.value }))
        }
        required
      />
      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Login"}
      </Button>
    </form>
  );
}
