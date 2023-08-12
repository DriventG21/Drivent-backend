import { ApplicationError } from "@/protocols";

export function otherStepsError(): ApplicationError {
  return {
    name: "otherStepsError",
    message: "User must finish the other steps before enrolling to a activity"
  };
}
