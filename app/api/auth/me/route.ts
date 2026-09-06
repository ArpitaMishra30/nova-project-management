import {NextResponse} from 'next/server';import {getUser} from '@/lib/auth';export async function GET(){const u=await getUser();return NextResponse.json({user:u})}
