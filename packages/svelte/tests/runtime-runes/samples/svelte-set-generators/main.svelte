<script>
	import { SvelteSet } from 'svelte/reactivity';

	function *generator() {
		yield 1;
	}

	let gen = new SvelteSet(generator());
</script>

{#each gen as item}
	{item}
{/each}

