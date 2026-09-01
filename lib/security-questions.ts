export const SECURITY_QUESTIONS = [
  { id: "first_school", label: "What was the name of your first school?" },
  { id: "childhood_street", label: "What street did you live on as a child?" },
  { id: "first_job", label: "What was your first job?" },
  { id: "favorite_teacher", label: "What was the last name of a favorite teacher?" },
  { id: "childhood_nickname", label: "What childhood nickname did you have?" },
  { id: "first_concert", label: "What was the first concert or live show you attended?" },
] as const;

export type SecurityQuestionId = (typeof SECURITY_QUESTIONS)[number]["id"];

export function isSecurityQuestionId(value: unknown): value is SecurityQuestionId {
  return typeof value === "string" && SECURITY_QUESTIONS.some((question) => question.id === value);
}
