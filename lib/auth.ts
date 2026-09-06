import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { db } from './db';
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-change-me');
export async function createSession(userId: string) { return new SignJWT({ userId }).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('7d').sign(secret); }
export async function setSession(userId: string) { const token=await createSession(userId); (await cookies()).set('nova_session', token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:60*60*24*7,path:'/'}); }
export async function getUser() { const token=(await cookies()).get('nova_session')?.value; if(!token)return null; try { const {payload}=await jwtVerify(token,secret); const id=payload.userId as string; return db.user.findUnique({where:{id},select:{id:true,name:true,email:true,role:true}}); } catch{return null;} }
export async function requireUser(){ const user=await getUser(); if(!user) throw new Error('UNAUTHORIZED'); return user; }
