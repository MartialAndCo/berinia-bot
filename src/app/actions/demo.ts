'use server';

import { updateProject } from '@/lib/airtable';
import { revalidatePath } from 'next/cache';

export async function toggleDemoStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

    try {
        await updateProject(id, { status: newStatus });
        revalidatePath('/admin/dashboard');
        return { success: true, newStatus };
    } catch (error: any) {
        console.error("Failed to toggle status:", error);
        return { success: false, error: error.message || "Failed to update status" };
    }
}
