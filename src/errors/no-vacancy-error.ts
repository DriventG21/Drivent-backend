import { ApplicationError } from "@/protocols";

export function noVacancyError(): ApplicationError {
  return {
    name: "noVacancyError",
    message: "There are no vacancies left for this activity"
  };
}
