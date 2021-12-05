<script context="module">
	export function load({ page: { query } }) {
		const gist = query.get('gist');
		const example = query.get('example');
		const version = query.get('version');

		// redirect to v2 REPL if appropriate
		if (/^[^>]?[12]/.test(version)) {
			return {
				status: 302,
				redirect: `https://v2.svelte.dev/repl?${query}`
			};
		}

		const id = gist || example || 'hello-world';
		const q = version ? `?version=${version}` : ``;

		return {
			status: 301,
			redirect: `/repl/${id}${q}`
		};
	}
</script>
