<script>
	import { invalidateAll } from '$app/navigation';
	import { setContext } from 'svelte';

	setContext('app', {
		login: () => {
			const login_window = window.open(
				`${window.location.origin}/auth/login`,
				'login',
				'width=600,height=400'
			);

			window.addEventListener('message', function handler(event) {
				login_window.close();
				window.removeEventListener('message', handler);
				invalidateAll();
			});
		},

		logout: async () => {
			const r = await fetch(`/auth/logout`);
			if (r.ok) invalidateAll();
		}
	});
</script>

<slot />
