import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con service_role key. SOLO se usa dentro de Server Actions
 * (app/actions/*.ts) o Route Handlers. Nunca se importa en un
 * componente de cliente.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}