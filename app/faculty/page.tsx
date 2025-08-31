import { Typography } from "@mui/material";
import ApplicationsTable from "@/features/faculty/ApplicationsTable";

export const metadata = {
  title: "Faculty Review Portal | College Application Smart Portal"
};

export default function FacultyPortalPage() {
  return (
    <div>
      <Typography variant="h4" gutterBottom>Faculty Application Review Portal</Typography>
      <ApplicationsTable />
    </div>
  );
}
