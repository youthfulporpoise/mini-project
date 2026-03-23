import { format, parseISO } from "date-fns";

export const formatDate = (dateString: string) => {
  return format(parseISO(dateString), "MMMM dd, yyyy");
};

export const toISOFormat = (date: string): string => {
  return `${date}T00:00:00Z`;
};