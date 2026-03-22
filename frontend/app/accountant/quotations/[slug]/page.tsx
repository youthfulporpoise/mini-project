import PaymentButton from "@/app/components/PaymentButton";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const quotationId = params.slug as string;
  const amount = 1000;

  if (!quotationId) return null;

  return (
    <div>
      <PaymentButton quotationId={quotationId} amount={amount} />
    </div>
  );
}
