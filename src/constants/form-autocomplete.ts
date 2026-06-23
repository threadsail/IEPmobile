/** Disable browser autofill on one-off operational forms (students, schedule, IEP data, etc.). */
export const NO_AUTOFILL = "off" as const;

export const noAutofillFormProps = { autoComplete: NO_AUTOFILL } as const;

export const noAutofillFieldProps = { autoComplete: NO_AUTOFILL } as const;
