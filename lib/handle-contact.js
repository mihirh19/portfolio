import { z } from "zod";
import { contactSchema } from "./contact-schema";

export async function handleContact(formData, { send }) {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  if (String(formData.get("website") ?? "")) return { status: "success" };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Please fix the highlighted fields.",
    };
  }

  if (!send) {
    return { status: "error", message: "Email isn't configured yet — please use the email link instead." };
  }

  try {
    await send(parsed.data);
    return { status: "success" };
  } catch {
    return { status: "error", message: "Something went wrong sending your message. Please try again." };
  }
}
