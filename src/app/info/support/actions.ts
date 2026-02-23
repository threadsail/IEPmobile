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

  // TODO: Send email to jordan@threadsail.io or wire to your email API
  return { success: true, error: null };
}
