import { Paper, Typography } from "@mui/material";
import ApplicationsTable from "@/features/faculty/ApplicationsTable";

export const metadata = {
  title: "Faculty Review Portal | College Application Smart Portal",
};

export default function FacultyPortalPage() {
  return (
    <div>
      <Paper elevation={0} sx={{ p: 2, bgcolor: "background.paper", mb: 2 }}>
        <Typography variant="h4" gutterBottom color="text.primary">
          Faculty Application Review Portal
        </Typography>
      </Paper>
      <ApplicationsTable />
    </div>
  );
}
