<script>
	import { createRawSnippet } from 'svelte';

	let count = $state(0);

	const hello = createRawSnippet({
		mount(count) {
			const p = document.createElement('p')

			$effect(() => {
				p.textContent = `clicks: ${count()}`
			});

			return p;
		},
		render(count) {
			return `<p>clicks: ${count}</p>`;
		}
	});
</script>

<button onclick={() => count += 1}>click</button>

{@render hello(count)}
