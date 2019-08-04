import { writable } from 'svelte/store';


export const user = writable(null);

if (process.browser) {
	const storageKey = 'svelte-dev:token';

	// On load, get the last-known user token (if any)
	// Note: We can skip this all by writing User data?
	const token = localStorage.getItem(storageKey);

	// Write changes to localStorage
	user.subscribe(obj => {
		if (obj) {
			localStorage.setItem(storageKey, obj.token);
		} else {
			localStorage.removeItem(storageKey);
		}
	});

	if (token) {
		// If token, refresh the User data from API
		const headers = { Authorization: `Bearer ${token}` };
		fetch('/auth/me.json', { headers })
			.then(r => r.ok ? r.json() : null)
			.then(user.set);
	}
}

export function logout() {
	user.set(null);
}
