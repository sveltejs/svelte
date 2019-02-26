import { writable } from 'svelte/store';

export const user = writable(null);

if (process.browser) {
	// TODO this is a workaround for the fact that there's currently
	// no way to pass session data from server to client
	// TODO there is now! replace this with the session mechanism
	fetch('/auth/me.json', { credentials: 'include' })
		.then(r => r.json())
		.then(user.set);
}

export async function logout() {
	const r = await fetch(`/auth/logout`, { method: 'POST' });
	if (r.ok) user.set(null);
}