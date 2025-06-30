// lib/init/checkOrCreateTables.ts

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function checkAndCreateTables() {
  const tableSchemas = [
    {
      name: "profiles",
      createSQL: `
        create table public.profiles (
          wallet_address text not null primary key,
          username       text not null,
          avatar_url     text not null,
          created_at     timestamptz not null default now(),
          updated_at     timestamptz not null default now()
        );
      `,
    },
    {
      name: "daily_activity",
      createSQL: `
        create table public.daily_activity (
          wallet_address text not null,
          activity_date date not null,
          games_played int not null default 0,
          tokens_earned int not null default 0,
          inserted_at timestamptz not null default now(),

          primary key (wallet_address, activity_date),
          foreign key (wallet_address) references public.profiles(wallet_address)
        );
      `,
    },
  ];

  const { data: existingTables, error: tableError } = await supabase
    .from("pg_tables")
    .select("tablename")
    .eq("schemaname", "public");

  if (tableError) {
    console.error("❌ Error loading table list", tableError.message);
    return;
  }

  for (const { name, createSQL } of tableSchemas) {
    const exists = existingTables?.some((t: any) => t.tablename === name);
    if (!exists) {
      console.warn(`⚠️ Table "${name}" not found. Please create manually:\n${createSQL}`);
    } else {
      console.log(`✅ Table "${name}" exists`);
    }
  }
}
