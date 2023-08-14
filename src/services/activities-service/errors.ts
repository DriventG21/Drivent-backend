import { ApplicationError } from "@/protocols";

export function otherStepsError(): ApplicationError {
  return {
    name: "otherStepsError",
    message: "User must finish the other steps before choosing a activity"
  };
}

export function paymentRequiredError(): ApplicationError {
  return {
    name: "paymentRequiredError",
    message: "User must enroll, reserve and pay a ticket before choosing a activity"
  };
}

