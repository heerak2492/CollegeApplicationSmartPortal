// features/student/schemas.ts
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
    .refine((s) => isValidIsoDate(s), {
      message: "Use YYYY-MM-DD (valid calendar date)",
    }),
});

// --- Education ---
export const educationDetailsSchema = z.object({
  highSchoolName: z.string().min(1, "High School Name is required"),
  gpaScore: z.coerce
    .number({ invalid_type_error: "GPA must be a valid number", required_error: "GPA is required" })
    .min(0, "GPA must be at least 0")
    .max(10, "GPA must be at most 10"),

  // Allow "" while the user is typing; require a real year on validation.
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
        .max(
          new Date().getFullYear() + 1,
          `Graduation Year must be ≤ ${new Date().getFullYear() + 1}`,
        ),
    ])
    .refine((v) => v !== "", { message: "Graduation Year is required" }),
});

// --- Program Selection ---
// Allow "" initially for intakeSeason and require a real value before advancing.
// Allow null initially for scholarship; require user to choose true/false.
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
  // Accept any non-empty string so relative paths (/uploads/a.pdf), blob:, data:, etc. are allowed.
  uploadedDocumentUrls: z.array(z.string().min(1, "Invalid document reference")).default([]),
});

export const applicationFormSchema = personalDetailsSchema
  .merge(educationDetailsSchema)
  .merge(programSelectionSchema)
  .merge(documentsSchema);

export type ApplicationForm = z.infer<typeof applicationFormSchema>;
