"use server";

export type SupportFormState = { error: string | null; success?: boolean };

export async function submitSupportForm(
  _prev: SupportFormState,
  formData: FormData
): Promise<SupportFormState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const subject = (formData.get("subject") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !subject || !message) {
    return { error: "Please fill out all fields." };
  }

  // TODO: Wire support form to email API (recipient: SUPPORT_EMAIL)
  return { success: true, error: null };
}
