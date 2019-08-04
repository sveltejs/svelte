<script context="module">
	export function preload({ query }) {
		const { gist, example, version } = query;

		// redirect to v2 REPL if appropriate
		if (/^[^>]?[12]/.test(version)) {
			const q = Object.keys(query).map(key => `${key}=${query[key]}`).join('&');
			return this.redirect(302, `https://v2.svelte.dev/repl?${q}`);
		}

		const id = gist || example || 'hello-world';
		const q = version ? `?version=${version}` : ``;

		this.redirect(301, `repl/${id}${q}`);
	}
</script>