import "server-only";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireAdmin(): Promise<{ email: string; userId: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return { email: user.email ?? "admin", userId: user.id };
}