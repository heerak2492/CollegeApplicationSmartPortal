import { Card, CardContent, Typography, Grid, Button, CardActions, Box } from "@mui/material";
import Link from "next/link";

function PortalCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        backdropFilter: "blur(4px)",
      }}
      elevation={2}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2 }}>
        <Button variant="contained" fullWidth component={Link} href={href}>
          Open {title}
        </Button>
      </CardActions>
    </Card>
  );
}

export default function HomePage() {
  return (
    <Box>
      <Grid container spacing={3} mt={1} alignItems="stretch">
        <Grid item xs={12} md={6}>
          <PortalCard
            title="Student Portal"
            description="Submit and track your college application with an AI assistant, document upload, and helpful video tutorials."
            href="/student"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <PortalCard
            title="Faculty Review Portal"
            description="Review applications, filter and sort candidates, and update statuses with clear actions."
            href="/faculty"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
