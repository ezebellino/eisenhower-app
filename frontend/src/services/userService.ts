import { fetchJson } from "./api";

export type UserSummary = {
  id: number;
  username: string;
  email: string;
  role: "user" | "supervisor";
  is_active: boolean;
};

export async function listUsers(): Promise<UserSummary[]> {
  return fetchJson<UserSummary[]>("/users/");
}
