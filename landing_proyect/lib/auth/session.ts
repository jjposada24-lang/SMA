import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { PublicUser } from './users';

const COOKIE_NAME = 'auth_session';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type SessionPayload = PublicUser & { iat: number };

const encode = (data: SessionPayload) => Buffer.from(JSON.stringify(data)).toString('base64url');
export const decode = (value: string | undefined): SessionPayload | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as SessionPayload;
    return parsed;
  } catch {
    return null;
  }
};

export const getSession = async (): Promise<SessionPayload | null> => {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(COOKIE_NAME)?.value;
    return decode(raw);
  } catch {
    return null;
  }
};

export const withSessionCookie = (res: NextResponse, user: PublicUser) => {
  const payload: SessionPayload = { ...user, iat: Date.now() };
  res.cookies.set({
    name: COOKIE_NAME,
    value: encode(payload),
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // local/dev only
    path: '/',
    maxAge: ONE_DAY_MS / 1000,
  });
  return res;
};

export const clearSessionCookie = (res: NextResponse) => {
  res.cookies.set({
    name: COOKIE_NAME,
    value: '',
    maxAge: 0,
    path: '/',
  });
  return res;
};


