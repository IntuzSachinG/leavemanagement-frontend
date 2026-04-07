
import { AuthShell } from "@/components/auth/authProtected";
import { SignupForm } from "@/components/auth/signupForm";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create a new employee account"
      subtitle="Connect with your routes"
      altLabel="Login"
      altHref="/login"
      altText="Already have an account?"
    >
      <SignupForm />
    </AuthShell>
  );
}
