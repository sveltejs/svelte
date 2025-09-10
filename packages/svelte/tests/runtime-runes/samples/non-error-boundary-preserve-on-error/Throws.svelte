<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	
  let outside_basic = $state(false);
	let outside_basic_set = new SvelteSet();
	const throws_basic = $derived.by(() => {
		outside_basic_set.add(1);
		return outside_basic_set;
	})
</script>

<button onclick={() => (outside_basic = true)}>click me if u dare</button>
{#if outside_basic && throws_basic}
	{throws_basic}
{/if}
<p>this should be rendered</p>