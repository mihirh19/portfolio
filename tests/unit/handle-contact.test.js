import { describe, expect, test, mock } from "bun:test";
import { handleContact } from "@/lib/handle-contact";

function fd(fields) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

const valid = { name: "Ada Lovelace", email: "ada@example.com", message: "Hello there, let's build something." };

describe("handleContact", () => {
  test("honeypot filled → success without sending", async () => {
    const send = mock(async () => {});
    const res = await handleContact(fd({ ...valid, website: "spam.com" }), { send });
    expect(res.status).toBe("success");
    expect(send).not.toHaveBeenCalled();
  });

  test("invalid fields → error with field messages", async () => {
    const send = mock(async () => {});
    const res = await handleContact(fd({ name: "A", email: "bad", message: "short" }), { send });
    expect(res.status).toBe("error");
    expect(res.errors.name[0]).toBe("Please enter your name");
    expect(res.errors.email[0]).toBe("Please enter a valid email");
    expect(res.errors.message[0]).toBe("Message should be at least 10 characters");
    expect(send).not.toHaveBeenCalled();
  });

  test("valid + no sender configured → error", async () => {
    const res = await handleContact(fd(valid), { send: null });
    expect(res).toEqual({ status: "error", message: "Email isn't configured yet — please use the email link instead." });
  });

  test("valid → sends trimmed data and succeeds", async () => {
    const send = mock(async () => {});
    const res = await handleContact(fd({ ...valid, name: "  Ada Lovelace  " }), { send });
    expect(res).toEqual({ status: "success" });
    expect(send).toHaveBeenCalledWith({ name: "Ada Lovelace", email: valid.email, message: valid.message });
  });

  test("sender throws → error", async () => {
    const send = mock(async () => {
      throw new Error("boom");
    });
    const res = await handleContact(fd(valid), { send });
    expect(res).toEqual({ status: "error", message: "Something went wrong sending your message. Please try again." });
  });
});
