<script>
	import { createRawSnippet } from 'svelte';

	let count = $state(0);

	const hello = createRawSnippet({
		render(count) {
			return `<p>clicks: ${count}</p>`;
		},
		update(p, count) {
			$effect(() => {
				p.textContent = `clicks: ${count()}`
			});
		}
	});
</script>

<button onclick={() => count += 1}>click</button>

{@render hello(count)}
