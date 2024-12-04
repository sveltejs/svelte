<script>
	import { createRawSnippet, hydrate } from 'svelte';
	import { render } from 'svelte/server';
	import Child from './Child.svelte';

	let { browser } = $props();

	let count = $state(0);

	const hello = createRawSnippet((count) => ({
		render: () => `
			<div>${browser ? '' : render(Child).body}</div>
		`,
		setup(target) {
			hydrate(Child, { target })
		}
	}));
</script>

<div>
	{@render hello()}
</div>
