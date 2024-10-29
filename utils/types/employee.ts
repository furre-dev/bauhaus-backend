export type Employee = {
  id: string,
  created_at: string,
  first_name: string,
  last_name: string,
  store: number,
  store_role: "worker" | "manager",
  user_role: "admin" | "user"
}