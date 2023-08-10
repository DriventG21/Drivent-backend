import { ApplicationError } from "@/protocols";

export function notFoundError(str: string = undefined): ApplicationError {
  return {
    name: "NotFoundError",
    message: str || "No result for this search!",
  };
}
