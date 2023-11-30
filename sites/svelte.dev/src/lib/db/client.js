import { dev } from '$app/environment';
import { SUPABASE_URL, SUPABASE_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';

const client_enabled = !!(!dev || (SUPABASE_URL && SUPABASE_KEY));

/**
 * @type {import('@supabase/supabase-js').SupabaseClient<any, "public", any>}
 */
// @ts-ignore-line
export const client =
	client_enabled &&
	createClient(SUPABASE_URL, SUPABASE_KEY, {
		global: { fetch },
		auth: { persistSession: false }
	});
