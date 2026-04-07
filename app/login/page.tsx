
import { AuthShell } from "@/components/auth/authProtected";
import { LoginForm } from "@/components/auth/loginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Login to your workspace"
      subtitle="Connect with your routes"
      altLabel="Sign up"
      altHref="/signup"
      altText="Need an employee account?"
    >
      <LoginForm />
    </AuthShell>
  );
}