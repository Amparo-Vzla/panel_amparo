// src/routes/dashboard/+layout.server.js
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    return {
        user: locals.user
    };
}