import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";

export const getStatusConfig = (status: number) => {
  switch (status) {
    case 1:
      return {
        label: "Approved",
        color: "bg-green-100 text-green-700",
        icon: CheckCircle,
        iconColor: "text-green-600",
      };
    case 0:
      return {
        label: "Pending Review",
        color: "bg-yellow-100 text-yellow-700",
        icon: Clock,
        iconColor: "text-yellow-600",
      };
    case 2:
      return {
        label: "Rejected",
        color: "bg-red-100 text-red-700",
        icon: XCircle,
        iconColor: "text-red-600",
      };
    default:
      return {
        label: "Unknown",
        color: "bg-gray-100 text-gray-700",
        icon: FileText,
        iconColor: "text-gray-600",
      };
  }
};
