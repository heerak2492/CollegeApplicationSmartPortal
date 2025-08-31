// features/student/ApplicationForm.tsx
"use client";
import React from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
  Link as MuiLink,
  Chip,
  Tooltip,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import {
  ApplicationForm,
  applicationFormSchema,
  personalDetailsSchema,
  educationDetailsSchema,
  programSelectionSchema,
} from "./schemas";
import DocumentUpload from "./DocumentUpload";
import ProfileCompletenessIndicator from "./ProfileCompletenessIndicator";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const steps = ["Personal Details", "Education Details", "Program Selection", "Documents"];

// LocalStorage key (manual drafts only)
const applicationFormDraftStorageKey = "studentApplicationDraft.v2";

const initialEmptyApplicationValues: ApplicationForm = {
  fullName: "",
  emailAddress: "",
  phoneNumber: "",
  dateOfBirth: "",
  highSchoolName: "",
  gpaScore: 0,
  graduationYear: "", // empty until user types
  intendedProgram: "",
  intakeSeason: "", // empty until chosen
  hasScholarshipInterest: null, // user must explicitly choose Yes/No
  uploadedDocumentUrls: [],
};

export default function ApplicationFormComponent() {
  // Always start fresh; we will *offer* to resume a saved draft after mount
  const formMethods = useForm<ApplicationForm>({
    defaultValues: initialEmptyApplicationValues,
    resolver: zodResolver(applicationFormSchema),
    mode: "onBlur",
  });

  const watchedValues = useWatch({ control: formMethods.control }) as ApplicationForm;
  // Enable Save/Preview only after at least one Personal field is filled
  const hasAnyPersonalInput = React.useMemo(() => {
    const trim = (s?: string) => (typeof s === "string" ? s.trim() : "");
    return Boolean(
      trim(watchedValues.fullName) ||
        trim(watchedValues.emailAddress) ||
        trim(watchedValues.phoneNumber) ||
        trim(watchedValues.dateOfBirth),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watchedValues.fullName,
    watchedValues.emailAddress,
    watchedValues.phoneNumber,
    watchedValues.dateOfBirth,
  ]);

  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = React.useState(false);

  const [errorSnackbarText, setErrorSnackbarText] = React.useState<string | null>(null);
  const [infoSnackbarText, setInfoSnackbarText] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // --- Draft offer banner state ---
  const [isDraftOfferVisible, setIsDraftOfferVisible] = React.useState(false);
  const [draftLastSavedIso, setDraftLastSavedIso] = React.useState<string | null>(null);

  // After mount, check if a draft exists and offer to resume it
  React.useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem(applicationFormDraftStorageKey)
          : null;
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.values) {
        setIsDraftOfferVisible(true);
        setDraftLastSavedIso(parsed.lastSavedIso || null);
      }
    } catch {
      // ignore bad drafts
    }
  }, []);

  // ---------- Progress (4 sections × 25%) with per-field increments ----------
  function isFieldDirty(dirty: Record<string, any>, name: keyof ApplicationForm) {
    return Boolean((dirty as any)[name]);
  }

  function isFilledForProgress(
    name: keyof ApplicationForm,
    value: any,
    dirty: Record<string, any>,
  ) {
    if (!isFieldDirty(dirty, name)) return false;
    if (name === "hasScholarshipInterest") return value !== null; // must choose Yes/No
    if (name === "uploadedDocumentUrls") return Array.isArray(value) && value.length > 0;
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "number") return !Number.isNaN(value);
    if (typeof value === "boolean") return true;
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  }

  const personalFields: Array<keyof ApplicationForm> = [
    "fullName",
    "emailAddress",
    "phoneNumber",
    "dateOfBirth",
  ];
  const educationFields: Array<keyof ApplicationForm> = [
    "highSchoolName",
    "gpaScore",
    "graduationYear",
  ];
  const programFields: Array<keyof ApplicationForm> = [
    "intendedProgram",
    "intakeSeason",
    "hasScholarshipInterest",
  ];
  const documentsFields: Array<keyof ApplicationForm> = ["uploadedDocumentUrls"];

  function sectionPercent(
    fields: Array<keyof ApplicationForm>,
    values: ApplicationForm,
    dirty: Record<string, any>,
  ) {
    const filled = fields.filter((f) => isFilledForProgress(f, (values as any)[f], dirty)).length;
    return (filled / fields.length) * 25;
  }

  const percent = Math.round(
    sectionPercent(personalFields, watchedValues, formMethods.formState.dirtyFields) +
      sectionPercent(educationFields, watchedValues, formMethods.formState.dirtyFields) +
      sectionPercent(programFields, watchedValues, formMethods.formState.dirtyFields) +
      sectionPercent(documentsFields, watchedValues, formMethods.formState.dirtyFields),
  );

  // ---------- Step validation / navigation ----------
  const handleNext = async () => {
    let schema;
    if (currentStepIndex === 0) schema = personalDetailsSchema;
    else if (currentStepIndex === 1) schema = educationDetailsSchema;
    else if (currentStepIndex === 2) schema = programSelectionSchema;

    if (schema) {
      const parsed = schema.safeParse(formMethods.getValues());
      if (!parsed.success) {
        await formMethods.trigger();
        return;
      }
    }
    setCurrentStepIndex((i) => i + 1);
  };

  const handlePrevious = () => setCurrentStepIndex((i) => Math.max(0, i - 1));

  // ---------- Submit (validate all, jump to first error, or POST) ----------
  const getStepIndexForField = (field: keyof ApplicationForm): number => {
    if (personalFields.includes(field)) return 0;
    if (educationFields.includes(field)) return 1;
    if (programFields.includes(field)) return 2;
    if (documentsFields.includes(field)) return 3;
    return 0;
  };

  const focusField = (name: keyof ApplicationForm) => {
    const label = {
      fullName: "Full Name",
      emailAddress: "Email Address",
      phoneNumber: "Phone Number",
      dateOfBirth: "Date of Birth",
      highSchoolName: "High School Name",
      gpaScore: "GPA (0-10)",
      graduationYear: "Graduation Year",
      intendedProgram: "Intended Program",
      intakeSeason: "Intake Season",
      hasScholarshipInterest: "Scholarship Interest",
      uploadedDocumentUrls: "Upload",
    }[name];

    const el =
      (label &&
        document.querySelector<HTMLInputElement>(
          `input[aria-label="${label}"], input[name="${String(name)}"]`,
        )) ||
      document.querySelector<HTMLInputElement>("input, [role='textbox'], [role='combobox']");
    el?.focus();
  };

  function hasErrorForField(fieldName: keyof ApplicationForm, node: any): boolean {
    if (!node || typeof node !== "object") return false;
    if (fieldName in node) return true;
    for (const key of Object.keys(node)) {
      if (hasErrorForField(fieldName, node[key])) return true;
    }
    return false;
  }

  function findFirstErrorField(
    errs: Record<string, any>,
    orderedFields: Array<keyof ApplicationForm>,
  ): keyof ApplicationForm | null {
    for (const f of orderedFields) {
      if (hasErrorForField(f, errs)) return f;
    }
    return null;
  }

  const attemptSubmitAll = async () => {
    try {
      setIsSubmitting(true);
      setErrorSnackbarText(null);

      const isValid = await formMethods.trigger(); // validate everything
      if (!isValid) {
        const errs = formMethods.formState.errors as Record<string, any>;
        const ordered: Array<keyof ApplicationForm> = [
          ...personalFields,
          ...educationFields,
          ...programFields,
          ...documentsFields,
        ];
        const firstBad = findFirstErrorField(errs, ordered) ?? personalFields[0];
        const step = getStepIndexForField(firstBad);
        setCurrentStepIndex(step);
        setErrorSnackbarText("Please fix the highlighted fields before submitting.");
        setTimeout(() => focusField(firstBad), 50);
        return; // do not POST on invalid
      }

      // Build payload and POST
      const values = formMethods.getValues();
      let graduationYearNumber: number | undefined;
      if (typeof values.graduationYear === "string") {
        const trimmed = values.graduationYear.trim();
        graduationYearNumber = trimmed === "" ? undefined : Number(trimmed);
      } else {
        graduationYearNumber = Number(values.graduationYear);
      }
      const payload = {
        applicantFullName: values.fullName,
        intendedProgram: values.intendedProgram,
        emailAddress: values.emailAddress,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth,
        highSchoolName: values.highSchoolName,
        gpaScore: values.gpaScore,
        graduationYear: graduationYearNumber,
        intakeSeason: values.intakeSeason,
        hasScholarshipInterest: values.hasScholarshipInterest,
        uploadedDocumentUrls: values.uploadedDocumentUrls || [],
      };

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || `Submit failed with status ${res.status}`);
      }

      setIsSuccessDialogOpen(true);
      // Clear draft after successful submission
      try {
        window.localStorage.removeItem(applicationFormDraftStorageKey);
        setIsDraftOfferVisible(false);
      } catch {}
    } catch (err: any) {
      setErrorSnackbarText(err?.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- Draft helpers ----------
  const saveDraft = () => {
    try {
      const values = formMethods.getValues(); // partial allowed; no validation here
      const snapshot = {
        values,
        currentStepIndex,
        lastSavedIso: new Date().toISOString(),
      };
      window.localStorage.setItem(applicationFormDraftStorageKey, JSON.stringify(snapshot));
      setIsDraftOfferVisible(true);
      setDraftLastSavedIso(snapshot.lastSavedIso);
      setInfoSnackbarText("Draft saved.");
    } catch (e) {
      setErrorSnackbarText("Could not save draft.");
    }
  };

  const resumeDraft = () => {
    try {
      const raw = window.localStorage.getItem(applicationFormDraftStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.values) return;
      // Reset form and step from snapshot
      formMethods.reset(parsed.values as ApplicationForm);
      setCurrentStepIndex(
        typeof parsed.currentStepIndex === "number" ? parsed.currentStepIndex : 0,
      );
      setIsDraftOfferVisible(false);
      setInfoSnackbarText("Draft resumed.");
    } catch {
      setErrorSnackbarText("Draft is corrupted and could not be resumed.");
    }
  };

  const discardDraft = () => {
    try {
      window.localStorage.removeItem(applicationFormDraftStorageKey);
      setIsDraftOfferVisible(false);
      setDraftLastSavedIso(null);
      setInfoSnackbarText("Draft discarded.");
    } catch {
      setErrorSnackbarText("Could not discard draft.");
    }
  };

  // Remove a document URL from the form value
  const removeDocumentByUrl = (urlToRemove: string) => {
    const existing = formMethods.getValues("uploadedDocumentUrls") || [];
    const next = existing.filter((u) => u !== urlToRemove);
    formMethods.setValue("uploadedDocumentUrls", next, { shouldDirty: true });
  };

  return (
    <FormProvider {...formMethods}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Application Submission</Typography>

          {/* Draft banner */}
          {isDraftOfferVisible && (
            <Alert
              severity="info"
              action={
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small" onClick={resumeDraft}>
                    Resume draft
                  </Button>
                  <Button variant="text" size="small" onClick={discardDraft} color="inherit">
                    Discard
                  </Button>
                </Stack>
              }
            >
              {draftLastSavedIso
                ? `A saved draft was found (saved ${dayjs(draftLastSavedIso).format("MMM D, YYYY h:mm A")}).`
                : "A saved draft was found."}
            </Alert>
          )}

          <ProfileCompletenessIndicator percentComplete={percent} />

          <Stepper activeStep={currentStepIndex} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Personal Details */}
          {currentStepIndex === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="fullName"
                  control={formMethods.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Full Name"
                      fullWidth
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="emailAddress"
                  control={formMethods.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Email Address"
                      fullWidth
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="phoneNumber"
                  control={formMethods.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Phone Number"
                      fullWidth
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="dateOfBirth"
                  control={formMethods.control}
                  render={({ field, fieldState }) => {
                    const dayjsValue =
                      field.value && dayjs(field.value, "YYYY-MM-DD", true).isValid()
                        ? dayjs(field.value, "YYYY-MM-DD", true)
                        : null;

                    return (
                      <DatePicker
                        label="Date of Birth"
                        value={dayjsValue}
                        onChange={(newValue) => {
                          if (newValue && newValue.isValid()) {
                            field.onChange(newValue.format("YYYY-MM-DD"));
                          } else {
                            field.onChange("");
                          }
                        }}
                        format="YYYY-MM-DD"
                        disableFuture
                        openTo="year"
                        views={["year", "month", "day"]}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            placeholder: "YYYY-MM-DD",
                            inputProps: {
                              inputMode: "numeric",
                              pattern: "[0-9]{4}-[0-9]{2}-[0-9]{2}",
                            },
                            error: !!fieldState.error,
                            helperText:
                              fieldState.error?.message ||
                              "Type YYYY-MM-DD or pick from the calendar",
                          },
                        }}
                      />
                    );
                  }}
                />
              </Grid>
            </Grid>
          )}

          {/* Education Details */}
          {currentStepIndex === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="highSchoolName"
                  control={formMethods.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="High School Name"
                      fullWidth
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Controller
                  name="gpaScore"
                  control={formMethods.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="GPA (0-10)"
                      type="number"
                      inputProps={{ min: 0, max: 10, step: 0.1, inputMode: "decimal" }}
                      fullWidth
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Controller
                  name="graduationYear"
                  control={formMethods.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Graduation Year"
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.value)}
                      inputProps={{
                        min: 1900,
                        max: new Date().getFullYear() + 1,
                        step: 1,
                        inputMode: "numeric",
                      }}
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {/* Program Selection */}
          {currentStepIndex === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="intendedProgram"
                  control={formMethods.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Intended Program"
                      fullWidth
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Controller
                  name="intakeSeason"
                  control={formMethods.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Intake Season"
                      select
                      fullWidth
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      SelectProps={{ displayEmpty: true }}
                    >
                      <MenuItem value="">
                        <em>Select…</em>
                      </MenuItem>
                      {["Spring", "Summer", "Fall", "Winter"].map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Controller
                  name="hasScholarshipInterest"
                  control={formMethods.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Scholarship Interest"
                      select
                      fullWidth
                      value={field.value === null ? "" : field.value}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === "" ? null : v === "true");
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      SelectProps={{ displayEmpty: true }}
                    >
                      <MenuItem value="">
                        <em>Select…</em>
                      </MenuItem>
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>
          )}

          {/* Documents */}
          {currentStepIndex === 3 && (
            <>
              <DocumentUpload
                onUploaded={(urls) => {
                  const existing = formMethods.getValues("uploadedDocumentUrls") || [];
                  formMethods.setValue("uploadedDocumentUrls", [...existing, ...urls], {
                    shouldDirty: true,
                  });
                }}
              />

              {/* Live list with delete "×" */}
              <Stack spacing={1} mt={2}>
                <Typography variant="subtitle2">Uploaded Documents</Typography>
                {watchedValues.uploadedDocumentUrls?.length ? (
                  <Stack direction="row" gap={1} flexWrap="wrap">
                    {watchedValues.uploadedDocumentUrls.map((url, i) => (
                      <Chip
                        key={url + i}
                        label={
                          <MuiLink href={url} target="_blank" rel="noopener" underline="hover">
                            Document {i + 1}
                          </MuiLink>
                        }
                        onDelete={() => removeDocumentByUrl(url)}
                        variant="outlined"
                        clickable
                        component="a"
                        href={url}
                        target="_blank"
                        rel="noopener"
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography color="text.secondary">No documents uploaded yet.</Typography>
                )}
              </Stack>
            </>
          )}

          {/* Wizard footer actions */}
          {/* Wizard footer actions */}
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Button onClick={handlePrevious} disabled={currentStepIndex === 0 || isSubmitting}>
              Previous
            </Button>

            <Stack direction="row" gap={1} alignItems="center">
              {/* Save Draft — disabled until a Personal field is filled */}
              <Tooltip
                title={
                  hasAnyPersonalInput
                    ? "Save a draft locally (you can resume later)"
                    : "Enter at least one Personal detail to enable"
                }
              >
                <span>
                  <Button
                    variant="outlined"
                    startIcon={<SaveOutlinedIcon />}
                    onClick={saveDraft}
                    disabled={isSubmitting || !hasAnyPersonalInput}
                  >
                    Save Draft
                  </Button>
                </span>
              </Tooltip>

              {/* Preview — disabled until a Personal field is filled */}
              <Tooltip
                title={
                  hasAnyPersonalInput
                    ? "Preview your application"
                    : "Enter at least one Personal detail to enable"
                }
              >
                <span>
                  <Button
                    variant="outlined"
                    onClick={() => setIsPreviewOpen(true)}
                    disabled={isSubmitting || !hasAnyPersonalInput}
                  >
                    Preview
                  </Button>
                </span>
              </Tooltip>

              {currentStepIndex < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext} disabled={isSubmitting}>
                  Next
                </Button>
              ) : (
                <Button variant="contained" onClick={attemptSubmitAll} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting…" : "Submit"}
                </Button>
              )}
            </Stack>
          </Box>
        </Stack>

        {/* Structured Preview (live) */}
        <Dialog
          open={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          fullWidth
          maxWidth="md"
          aria-labelledby="preview-dialog-title"
        >
          <DialogTitle id="preview-dialog-title">Application Preview</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3}>
              <section>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Personal Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography color="text.secondary">Full Name</Typography>
                    <Typography>{watchedValues.fullName || "—"}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography color="text.secondary">Email Address</Typography>
                    <Typography>{watchedValues.emailAddress || "—"}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography color="text.secondary">Phone Number</Typography>
                    <Typography>{watchedValues.phoneNumber || "—"}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography color="text.secondary">Date of Birth</Typography>
                    <Typography>{watchedValues.dateOfBirth || "—"}</Typography>
                  </Grid>
                </Grid>
              </section>

              <Divider />

              <section>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Education Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography color="text.secondary">High School Name</Typography>
                    <Typography>{watchedValues.highSchoolName || "—"}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography color="text.secondary">GPA</Typography>
                    <Typography>{watchedValues.gpaScore ?? "—"}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography color="text.secondary">Graduation Year</Typography>
                    <Typography>{watchedValues.graduationYear ?? "—"}</Typography>
                  </Grid>
                </Grid>
              </section>

              <Divider />

              <section>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Program Selection
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography color="text.secondary">Intended Program</Typography>
                    <Typography>{watchedValues.intendedProgram || "—"}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography color="text.secondary">Intake Season</Typography>
                    <Typography>{watchedValues.intakeSeason || "—"}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography color="text.secondary">Scholarship Interest</Typography>
                    <Typography>
                      {watchedValues.hasScholarshipInterest === null
                        ? "—"
                        : watchedValues.hasScholarshipInterest
                          ? "Yes"
                          : "No"}
                    </Typography>
                  </Grid>
                </Grid>
              </section>

              <Divider />

              <section>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Uploaded Documents
                </Typography>
                {watchedValues.uploadedDocumentUrls?.length ? (
                  <Stack direction="row" gap={1} flexWrap="wrap">
                    {watchedValues.uploadedDocumentUrls.map((url, i) => (
                      <Chip
                        key={url + i}
                        label={
                          <MuiLink href={url} target="_blank" rel="noopener" underline="hover">
                            Document {i + 1}
                          </MuiLink>
                        }
                        onDelete={() => removeDocumentByUrl(url)}
                        variant="outlined"
                        clickable
                        component="a"
                        href={url}
                        target="_blank"
                        rel="noopener"
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography color="text.secondary">No documents uploaded yet.</Typography>
                )}
              </section>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Success dialog */}
        <Dialog
          open={isSuccessDialogOpen}
          onClose={() => {
            // After success, start a fresh application form
            formMethods.reset(initialEmptyApplicationValues);
            setCurrentStepIndex(0);
            setIsPreviewOpen(false);
            setIsSuccessDialogOpen(false);
          }}
          aria-labelledby="submission-success-title"
        >
          <DialogTitle id="submission-success-title">
            Application submitted successfully
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary">
              Your application has been submitted and is now visible in the Faculty portal.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              onClick={() => {
                formMethods.reset(initialEmptyApplicationValues);
                setCurrentStepIndex(0);
                setIsPreviewOpen(false);
                setIsSuccessDialogOpen(false);
              }}
            >
              Start new application
            </Button>
          </DialogActions>
        </Dialog>

        {/* Info snackbar (e.g., draft saved/resumed/discarded) */}
        <Snackbar
          open={Boolean(infoSnackbarText)}
          autoHideDuration={2500}
          onClose={() => setInfoSnackbarText(null)}
        >
          <Alert severity="success" onClose={() => setInfoSnackbarText(null)}>
            {infoSnackbarText}
          </Alert>
        </Snackbar>

        {/* Error snackbar */}
        <Snackbar
          open={Boolean(errorSnackbarText)}
          autoHideDuration={3000}
          onClose={() => setErrorSnackbarText(null)}
        >
          <Alert severity="error" onClose={() => setErrorSnackbarText(null)}>
            {errorSnackbarText}
          </Alert>
        </Snackbar>
      </Paper>
    </FormProvider>
  );
}
