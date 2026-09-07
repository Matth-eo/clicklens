import { AuthForm } from "@/components/auth-form";
export default function Login() {
  return (
    <>
      <span className="eyebrow">WELCOME BACK</span>
      <h1>Good to see you again.</h1>
      <p className="muted">Sign in to see where your links are going.</p>
      <AuthForm mode="login" />
    </>
  );
}
