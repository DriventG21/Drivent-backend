import { ApplicationError } from "@/protocols";

export function cannotListHotelsError(message: string = undefined): ApplicationError {
  return {
    name: "cannotListHotelsError",
    message: message || "Cannot list hotels!",
  };
}
