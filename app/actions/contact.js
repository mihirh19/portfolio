"use server";

import { Resend } from "resend";
import { handleContact } from "@/lib/handle-contact";
import { site } from "@/content/site";

export async function sendContact(_prevState, formData) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || site.email;

  const send = key
    ? async ({ name, email, message }) => {
        const resend = new Resend(key);
        const { error } = await resend.emails.send({
          from: "Portfolio <onboarding@resend.dev>",
          to,
          replyTo: email,
          subject: `New portfolio message from ${name}`,
          text: `${message}\n\n— ${name} <${email}>`,
        });
        if (error) throw new Error(error.message);
      }
    : null;

  return handleContact(formData, { send });
}
