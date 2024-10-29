import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import dotenv from 'dotenv';
import { getUserStore, userIsManager } from "../utils/isUserManager";

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  options: z.object({
    data: z.object({
      first_name: z.string().min(1),
      last_name: z.string().min(1),
    }),
  }),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed. Only POST requests are accepted.",
    });
  }

  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({
      error: "Authorization token is required.",
    });
  }

  const storeRole = await userIsManager(accessToken)
  if (!storeRole || !storeRole.isManager) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const validation = userSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: "Failed to validate schema of body.",
      details: validation.error.errors,
    });
  }

  const body: {
    email: string,
    password: string,
    options: {
      data: {
        first_name: string,
        last_name: string,
      }
    }
  } = req.body

  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    options: {
      data: {
        first_name: body.options.data.first_name,
        last_name: body.options.data.last_name,
        store_id: storeRole.store
      }
    }
  });

  if (error) {
    return res.status(error.status || 400).json({
      error: "Failed to create user",
      details: error,
    });
  }

  await supabase.auth.signOut();

  return res.status(200).json({ message: `create user with id ${data.user?.id}` })
}
