/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
import type { User, Session } from "@supabase/supabase-js";

// Client-side public environment variables (prefixed with PUBLIC_)
// These are available in both server and browser
interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Server-side environment variables (accessed via process.env)
// These are ONLY available on the server
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEBUG_AUTH?: string;
    }
  }

  namespace App {
    interface Locals {
      user: User | null;
      session: Session | null;
    }
  }
}