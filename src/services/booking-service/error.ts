import { ApplicationError } from "@/protocols";

export function forbiddenError(): ApplicationError {
  return {
    name: "FORBIDDEN",
    message: "an error where encoutered in your request",
  };
}
