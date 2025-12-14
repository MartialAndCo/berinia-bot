'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_PASSWORD = process.env.SCRAP_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

export async function verifyPassword(password: string) {
    if (!ADMIN_PASSWORD) {
        console.warn("ADMIN_PASSWORD check: MISSING in env process.env");
        console.log("Available Env Keys:", Object.keys(process.env).filter(k => !k.includes('KEY') && !k.includes('SECRET'))); // Log non-sensitive keys
        return { success: false, error: "System configuration error (Env Var Missing)" };
    }
    // console.log("ADMIN_PASSWORD check: Present"); // Uncomment for deeper debug if needed

    if (password === ADMIN_PASSWORD) {
        const cookieStore = await cookies();
        cookieStore.set('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });
        return { success: true };
    }

    return { success: false, error: "Invalid password" };
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    redirect('/admin');
}

export async function checkSession() {
    const cookieStore = await cookies();
    return cookieStore.has('admin_session');
}
