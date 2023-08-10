import { ApplicationError } from "@/protocols";

export function forbiddenError(str: string = undefined): ApplicationError {
  return {
    name: "ForbiddenAction",
    message: str,
  };
}
