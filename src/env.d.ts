/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
import type { User, Session } from "@supabase/supabase-js";

interface ImportMetaEnv {
  readonly SUPABASE_URL: string
  readonly SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  namespace App {
    interface Locals {
      user: User | null;
      session: Session | null;
    }
  }
}