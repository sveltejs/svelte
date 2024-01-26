import { redirect } from '@sveltejs/kit';

export function load() {
	redirect(307, 'https://docs.google.com/document/d/1IA9Z5rcIm_KRxvh_L42d2NDdYRHZ72MfszhyJrsmf5A');
}
