export const default_files = [
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

			<button on:click={increment}>
				clicks: {count}
			</button>
		`
			.replace(/^\t{3}/gm, '')
			.trim()
	}
];
