import { createClient, QueryData } from "@supabase/supabase-js";
import { Employee } from "./types/employee";
import dotenv from 'dotenv';
import { Database } from "../database.types";

dotenv.config({ path: '.env.local' });

const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

export async function userIsManager(accessToken: string) {
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data) {
    return null
  }

  const userStoreRole = await getUserStoreRole(data.user.id);
  const storeId = await getUserStore(data.user.id)

  const managerObject = {
    isManager: userStoreRole === "manager" ? true : false,
    store: storeId
  }

  return managerObject
}

type UserStoreRole = {
  store_role: Database["public"]["Tables"]["employees"]["Row"]["store_role"]
}

export async function getUserStoreRole(UUID: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('store_role')
    .eq('id', UUID)
    .single();

  if (error || !data) return null

  return data.store_role
}

type UserStore = {
  store: Database["public"]["Tables"]["employees"]["Row"]["store"]
}

export async function getUserStore(UUID: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('store')
    .eq('id', UUID)
    .single();

  if (error || !data) return null

  return data.store
}