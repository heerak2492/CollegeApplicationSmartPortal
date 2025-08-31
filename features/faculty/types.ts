export type ReviewStatus = "Pending" | "Approved" | "Rejected";

export interface ApplicationRecord {
  id: string;
  applicantFullName: string;
  intendedProgram: string;
  submittedAtIso: string;
  status: ReviewStatus;

  emailAddress?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  highSchoolName?: string;
  gpaScore?: number;
  graduationYear?: number;
  intakeSeason?: string;
  hasScholarshipInterest?: boolean;

  uploadedDocumentUrls?: string[]; // <-- added
}
