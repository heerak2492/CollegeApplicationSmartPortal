import { Grid, Typography } from "@mui/material";
import ApplicationFormComponent from "@/features/student/ApplicationForm";
import ChatAssistant from "@/features/student/ChatAssistant";
import VideoTutorial from "@/features/student/VideoTutorial";

export const metadata = {
  title: "Student Portal | College Application Smart Portal",
};

export default function StudentPortalPage() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          College Application Smart Portal
        </Typography>
      </Grid>

      <Grid item xs={12} md={7}>
        <ApplicationFormComponent />
      </Grid>
      <Grid item xs={12} md={5}>
        <ChatAssistant />
      </Grid>

      <Grid item xs={12}>
        <VideoTutorial />
      </Grid>
    </Grid>
  );
}
