import { Alert, AlertTitle, Button } from "@mui/material";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mt-8">
      <Alert severity="warning" variant="outlined">
        <AlertTitle>Page Not Found</AlertTitle>
        The page you are looking for does not exist.
      </Alert>
      <Button className="mt-4" variant="contained" component={Link} href="/">
        Go Home
      </Button>
    </div>
  );
}
