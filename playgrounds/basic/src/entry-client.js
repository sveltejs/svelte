import App from './App.svelte';

new App({
	target: document.getElementById('app'),
	hydrate: true
});

function get_version() {
	return fetch('/version.json').then((r) => r.json());
}

let prev = await get_version();

// Mom: We have live reloading at home
// Live reloading at home:
while (true) {
	await new Promise((r) => setTimeout(r, 2500));
	try {
		const version = await get_version();
		if (prev !== version) {
			window.location.reload();
		}
	} catch {}
}
