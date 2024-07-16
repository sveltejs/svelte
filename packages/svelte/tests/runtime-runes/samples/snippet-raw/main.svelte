<script>
	import { createRawSnippet } from 'svelte';

	let count = $state(0);

	const hello = createRawSnippet((count) => ({
		render: () => `
			<p>clicks: ${count()}</p>
		`,
		setup(p) {
			$effect(() => {
				p.textContent = `clicks: ${count()}`
			});
		}
	}));
</script>

<button onclick={() => count += 1}>click</button>

{@render hello(count)}
