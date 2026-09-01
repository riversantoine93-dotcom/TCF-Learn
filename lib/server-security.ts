import { supabaseAdmin } from "@/lib/server-payments";
import { isSecurityQuestionId, type SecurityQuestionId } from "@/lib/security-questions";

type SecurityAnswer = { question: SecurityQuestionId; answer: string };

function normalizeAnswer(answer: string) {
  return answer.trim().toLowerCase().replace(/\s+/g, " ");
}

function toBase64(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64");
}

async function hashAnswer(answer: string) {
  const normalized = normalizeAnswer(answer);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(normalized), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 210000, hash: "SHA-256" }, key, 256);
  return { hash: toBase64(new Uint8Array(bits)), salt: toBase64(salt) };
}

export function validateSecurityAnswers(input: unknown): SecurityAnswer[] {
  if (!Array.isArray(input) || input.length !== 3) throw new Error("Choose and answer all three security questions.");
  const answers = input.map((item) => {
    const question = item?.question;
    const answer = item?.answer;
    if (!isSecurityQuestionId(question) || typeof answer !== "string" || answer.trim().length < 2) {
      throw new Error("Choose and answer all three security questions.");
    }
    return { question, answer: answer.trim() };
  });
  if (new Set(answers.map((item) => item.question)).size !== 3) throw new Error("Choose three different security questions.");
  return answers;
}

export async function saveSecurityQuestions(userId: string, answers: SecurityAnswer[]) {
  const [one, two, three] = await Promise.all(answers.map((item) => hashAnswer(item.answer)));
  const payload = {
    user_id: userId,
    question_1: answers[0].question,
    answer_hash_1: one.hash,
    answer_salt_1: one.salt,
    question_2: answers[1].question,
    answer_hash_2: two.hash,
    answer_salt_2: two.salt,
    question_3: answers[2].question,
    answer_hash_3: three.hash,
    answer_salt_3: three.salt,
    updated_at: new Date().toISOString(),
  };
  const res = await supabaseAdmin("/rest/v1/account_security_questions", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Unable to save account recovery questions.");
}
