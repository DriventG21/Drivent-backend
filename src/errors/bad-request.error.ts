import { ApplicationError } from "@/protocols";

export function badRequestError(): ApplicationError {
  return {
    message: "Bad request",
    name: "BadRequestError",
  };
}
