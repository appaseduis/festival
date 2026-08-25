"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type ResultadoLogin = { ok: true } | { ok: false; error: string };

export async function iniciarSesionAction(
  email: string,
  password: string
): Promise<ResultadoLogin> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, error: "Correo o contraseña incorrectos." };
  }

  return { ok: true };
}

export async function cerrarSesionAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}