import { z } from "zod";

const currentYear = new Date().getFullYear();
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

const isValidIsoDate = (s: string) => {
  if (!isoDateRegex.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};

export const personalDetailsSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  emailAddress: z.string().email("Enter a valid email address"),
  phoneNumber: z.string().min(7, "Enter a valid phone number"),
  dateOfBirth: z
    .string()
    .min(1, "Date of Birth is required")
    .refine(isValidIsoDate, { message: "Use YYYY-MM-DD (valid calendar date)" }),
});

export const educationDetailsSchema = z.object({
  highSchoolName: z.string().min(1, "High School Name is required"),
  gpaScore: z.coerce
    .number({ invalid_type_error: "GPA must be a valid number", required_error: "GPA is required" })
    .min(0, "GPA must be at least 0")
    .max(10, "GPA must be at most 10"),
  graduationYear: z
    .union([
      z.literal(""),
      z.coerce
        .number({
          invalid_type_error: "Graduation Year must be a number",
          required_error: "Graduation Year is required",
        })
        .int("Graduation Year must be an integer")
        .min(1900, "Graduation Year must be ≥ 1900")
        .max(currentYear + 1, `Graduation Year must be ≤ ${currentYear + 1}`),
    ])
    .refine((v) => v !== "", { message: "Graduation Year is required" }),
});

export const programSelectionSchema = z.object({
  intendedProgram: z.string().min(1, "Intended Program is required"),
  intakeSeason: z
    .union([z.literal(""), z.enum(["Spring", "Summer", "Fall", "Winter"])])
    .refine((v) => v !== "", { message: "Intake Season is required" }),
  hasScholarshipInterest: z.union([z.boolean(), z.null()]).refine((v) => v !== null, {
    message: "Please select Yes or No",
  }),
});

export const documentsSchema = z.object({
  uploadedDocumentUrls: z.array(z.string().min(1, "Invalid document reference")).default([]),
});

export const applicationFormSchema = personalDetailsSchema
  .merge(educationDetailsSchema)
  .merge(programSelectionSchema)
  .merge(documentsSchema);

// ---------- Types ----------
/** Strict type that the server expects (post-coercion, post-refine). */
export type ApplicationFormPayload = z.output<typeof applicationFormSchema>;

/** UI/form type that allows ""/null while the user is typing. */
export type ApplicationFormValues = {
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  dateOfBirth: string;
  highSchoolName: string;
  gpaScore: number;
  graduationYear: "" | number;
  intendedProgram: string;
  intakeSeason: "" | "Spring" | "Summer" | "Fall" | "Winter";
  hasScholarshipInterest: boolean | null;
  uploadedDocumentUrls: string[];
};

// ---------- Defaults for the form ----------
export const initialEmptyApplicationValues: ApplicationFormValues = {
  fullName: "",
  emailAddress: "",
  phoneNumber: "",
  dateOfBirth: "",
  highSchoolName: "",
  gpaScore: 0,
  graduationYear: "", // ok: "" | number
  intendedProgram: "",
  intakeSeason: "", // ok: "" | Season
  hasScholarshipInterest: null, // ok: boolean | null
  uploadedDocumentUrls: [],
};
