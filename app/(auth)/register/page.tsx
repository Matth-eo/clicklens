import { AuthForm } from "@/components/auth-form";
export default function Register() {
  return (
    <>
      <span className="eyebrow">LET’S MAKE CONNECTIONS</span>
      <h1>Your links, in focus.</h1>
      <p className="muted">Create an account and make your first short link.</p>
      <AuthForm mode="register" />
    </>
  );
}
