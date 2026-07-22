// src/routes/dashboard/admin/+layout.server.js
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    if (locals.user?.rol !== 'ADMIN') {
        throw redirect(303, '/dashboard');
    }
}