import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { setSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  let body: unknown;

  // Handle invalid JSON separately.
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  // Validate incoming login data.
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Please enter a valid email and password' },
      { status: 400 }
    );
  }

  try {
    const email = result.data.email.toLowerCase();
    const password = result.data.password;

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    await setSession(user.id);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    // Keep technical details in server logs, not in the response.
    console.error('[LOGIN_ERROR]', error);

    return NextResponse.json(
      { error: 'Unable to sign in right now. Please try again.' },
      { status: 500 }
    );
  }
}