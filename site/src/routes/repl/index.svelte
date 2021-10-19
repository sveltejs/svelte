<script context="module">
	export function load({ page: { query }}) {
		const { gist, example, version } = query;

		// redirect to v2 REPL if appropriate
		if (/^[^>]?[12]/.test(version)) {
			const q = Object.keys(query).map(key => `${key}=${query[key]}`).join('&');
			return {
				status: 302,
				redirect: `https://v2.svelte.dev/repl?${q}`
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