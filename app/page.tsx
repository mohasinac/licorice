// app/page.tsx � fallback redirect
// In practice the next-intl middleware redirects \/\ ? \/en\ before this runs.
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/en");
}
