<script>
  import { createRawSnippet } from 'svelte';

	let count = $state(0);

	const snippet = createRawSnippet({
		mount(count) {
			const div = document.createElement('div');

			$effect(() => {
				div.textContent = count();
			});

			return div;
		},
		hydrate(element, count) {

			$effect(() => {
				element.textContent = count();
			});

		},
		render(count) {
			return `<div>${count}</div>`;
		}
	});
</script>

<div>
	{@render snippet(count)}
</div>
<button onclick={() => count++}>+</button>
