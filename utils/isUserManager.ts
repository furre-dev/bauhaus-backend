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

  const userStoreData = await getUserStoreData(data.user.id);

  const managerObject = {
    isManager: userStoreData?.store_role === "manager" ? true : false,
    store: userStoreData?.store
  }

  return managerObject
}

export async function getUserStoreData(UUID: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('store_role, store')
    .eq('id', UUID)
    .single();

  if (error || !data) return null

  return data
}
