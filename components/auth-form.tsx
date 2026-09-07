"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { login, register } from "@/app/(auth)/actions";
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const registering = mode === "register";
  const [state, action, pending] = useActionState(
    registering ? register : login,
    {},
  );
  return (
    <form action={action} className="auth-form">
      {registering && (
        <label>
          Full name
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={60}
          />
        </label>
      )}
      <label>
        Email address
        <input
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          required
          maxLength={254}
        />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          placeholder={
            registering ? "Create a strong password" : "Enter your password"
          }
          autoComplete={registering ? "new-password" : "current-password"}
          required
          minLength={8}
          maxLength={128}
        />
      </label>
      {registering && (
        <p className="field-hint">
          At least 8 characters. Make it something only you know.
        </p>
      )}
      {state.error && (
        <p className="notice error" role="alert">
          {state.error}
        </p>
      )}
      <button className="button primary full" disabled={pending}>
        {pending ? <LoaderCircle className="spin" size={17} /> : null}
        {pending
          ? "Please wait…"
          : registering
            ? "Create your account"
            : "Sign in"}
        <ArrowRight size={17} />
      </button>
      <p className="auth-switch">
        {registering ? "Already have an account?" : "New to ClickLens?"}{" "}
        <Link href={registering ? "/login" : "/register"}>
          {registering ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
