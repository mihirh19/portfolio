"use client";

import { useActionState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { sendContact } from "@/app/actions/contact";
import Magnetic from "@/components/ui/Magnetic";
import { sceneStore } from "@/lib/scene-store";
import { site } from "@/content/site";

const initialState = { status: "idle" };

const labels = { idle: "Send message", sending: "Sending…", success: "Sent ✓", error: "Try again" };

function Field({ name, label, type = "text", error, textarea }) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <div className="relative">
      <Tag
        id={name}
        name={name}
        type={textarea ? undefined : type}
        rows={textarea ? 5 : undefined}
        placeholder=" "
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className="peer w-full resize-none rounded-2xl border border-line bg-card px-5 pt-7 pb-3 outline-none transition-colors focus:border-accent"
      />
      <label
        htmlFor={name}
        className="pointer-events-none absolute top-2 left-5 font-mono text-xs text-muted transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs"
      >
        {label}
      </label>
      {error && <p id={`${name}-error`} className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default function Contact() {
  const [state, formAction, pending] = useActionState(sendContact, initialState);
  const form = useRef(null);

  useEffect(() => {
    if (state.status === "success") {
      sceneStore.set({ pulse: performance.now() });
      form.current?.reset();
    }
  }, [state]);

  const status = pending ? "sending" : state.status;

  return (
    <section id="contact" data-section data-scene="orb" className="relative py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-2 md:px-12">
        <div>
          <p className="eyebrow">06 — Contact</p>
          <h2 className="mt-4 font-display text-6xl leading-[0.95] font-semibold tracking-tight md:text-8xl">
            Let&apos;s build <span className="text-accent">something</span>.
          </h2>
          <p className="mt-6 max-w-md text-lg text-muted">
            Have an idea, a role or just want to say hi? My inbox is always open.
          </p>
          <a href={`mailto:${site.email}`} className="mt-8 inline-block font-display text-xl underline-offset-8 hover:underline">
            {site.email}
          </a>
          <ul className="mt-10 flex flex-wrap gap-3">
            {site.socials.map((s) => (
              <li key={s.label}>
                <Magnetic>
                  <a href={s.href} target="_blank" rel="noreferrer" className="btn-ghost px-5 py-2.5 text-sm">{s.label}</a>
                </Magnetic>
              </li>
            ))}
          </ul>
        </div>

        <form ref={form} action={formAction} noValidate className="glass flex flex-col gap-5 p-6 md:p-8">
          <Field name="name" label="Your name" error={state.errors?.name?.[0]} />
          <Field name="email" label="Email" type="email" error={state.errors?.email?.[0]} />
          <Field name="message" label="Message" textarea error={state.errors?.message?.[0]} />
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

          <button type="submit" disabled={pending} className="btn-primary justify-center overflow-hidden disabled:opacity-70">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={status}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {labels[status]}
              </motion.span>
            </AnimatePresence>
          </button>

          <p role="status" aria-live="polite" className="min-h-6 text-sm text-muted">
            {state.status === "success" && "Thanks! I'll get back to you soon."}
            {state.status === "error" && state.message}
            {state.status === "error" && !state.errors && (
              <> <a className="underline" href={`mailto:${site.email}`}>Email me directly</a>.</>
            )}
          </p>
        </form>
      </div>
    </section>
  );
}
