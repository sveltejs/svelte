export const default_files = () => [
	{
		name: 'App',
		type: 'svelte',
		source: `
			<script>
				let count = $state(0);

				function increment() {
					count += 1;
				}
			</script>

			<button onclick={increment}>
				clicks: {count}
			</button>
		`
			.replace(/^\t{3}/gm, '')
			.trim()
	}
];
