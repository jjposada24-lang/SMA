import { NextResponse } from 'next/server';
import { verifyCredentials, publicFromDb } from '@/lib/auth/users';
import { withSessionCookie } from '@/lib/auth/session';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { username, password } = body ?? {};

  console.log('ENV URL', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing');
  console.log(
    'ENV ANON',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 12) ?? '',
  );

  if (!username || !password) {
    return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
  }

  const user = await verifyCredentials(username, password);
  if (!user) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  const publicUser = await publicFromDb(user);

  const res = NextResponse.json({
    ok: true,
    role: publicUser.role,
    redirect:
      publicUser.role === 'admin'
        ? '/admin/dashboard'
        : '/cliente/home',
  });

  return withSessionCookie(res, publicUser);
}

