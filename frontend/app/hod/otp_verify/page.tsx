import DeliveryVerificationClient from "@/app/components/DeliveryVerificationClient";
import { fetchQuotations } from "@/app/utility/api";

export default async function VerifyOTPPage() {
  const data = await fetchQuotations();

  const verifiedList = data.filter((q: any) => q.status === "APPROVED");

  return <DeliveryVerificationClient initialQuotations={verifiedList} />;
}
