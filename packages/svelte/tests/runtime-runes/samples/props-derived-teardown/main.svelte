<script>
	import { SvelteSet } from 'svelte/reactivity'
	import Teardown from './Teardown.svelte'

	class Test {
		originalIds = $state.raw([1, 2, 3])
		ids = $derived(new SvelteSet(this.originalIds))
	}

	let show = $state(true)
	const test = new Test()

	function callback() {
		test.ids.delete(2)
	}
</script>


<button onclick={() => (show = !show)}>click</button>
{#if show}
	<Teardown {callback} />
{/if}
{#each test.ids as id}
	<div>{id}</div>
{/each}
