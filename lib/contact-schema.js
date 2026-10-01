import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80, "Name is too long"),
  email: z.string().trim().pipe(z.email("Please enter a valid email")),
  message: z
    .string()
    .trim()
    .min(10, "Message should be at least 10 characters")
    .max(5000, "Message is too long"),
});
