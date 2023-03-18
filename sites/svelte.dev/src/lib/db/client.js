import { dev } from '$app/environment';
import { SUPABASE_URL, SUPABASE_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';

export const client =
	(!dev || (SUPABASE_URL && SUPABASE_KEY)) &&
	createClient(SUPABASE_URL, SUPABASE_KEY, { global: { fetch } });
