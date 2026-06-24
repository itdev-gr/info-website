import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASSWORD,
  SUPER_ADMIN_USERNAME,
  isSuperAdminCredentials,
} from '@/lib/super-admin';
import type { Database } from '@/types/database';

function envIsConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function loginResponse() {
  return NextResponse.json({ ok: true });
}

async function syncSuperAdminUser() {
  const admin = createAdminClient();
  const email = SUPER_ADMIN_EMAIL.toLowerCase();
  const attributes = {
    email,
    password: SUPER_ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { username: SUPER_ADMIN_USERNAME },
    app_metadata: { role: 'super_admin' },
  };

  const { data, error: listError } = await admin.auth.admin.listUsers();
  if (listError) throw listError;

  const existingUser = data.users.find((user) => user.email?.toLowerCase() === email);
  if (existingUser) {
    const { error } = await admin.auth.admin.updateUserById(existingUser.id, attributes);
    if (error) throw error;
    return;
  }

  const { error } = await admin.auth.admin.createUser(attributes);
  if (error) throw error;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === 'string' ? body.username : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!isSuperAdminCredentials(username, password)) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
  }

  if (!envIsConfigured()) {
    return NextResponse.json({ error: 'auth_not_configured' }, { status: 500 });
  }

  try {
    await syncSuperAdminUser();
  } catch (error) {
    console.error('Failed to sync super admin user', error);
    return NextResponse.json({ error: 'super_admin_sync_failed' }, { status: 500 });
  }

  let response = loginResponse();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = loginResponse();
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { error } = await supabase.auth.signInWithPassword({
    email: SUPER_ADMIN_EMAIL.toLowerCase(),
    password: SUPER_ADMIN_PASSWORD,
  });

  if (error) {
    console.error('Failed to sign in super admin user', error);
    return NextResponse.json({ error: 'super_admin_login_failed' }, { status: 500 });
  }

  return response;
}
