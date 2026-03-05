import { redirect } from "next/navigation";

// The switch/migration wizard is the default entry point.
// The full new-business wizard is at /wizard/new.
export default function WizardPage() {
  redirect("/wizard/switch");
}
