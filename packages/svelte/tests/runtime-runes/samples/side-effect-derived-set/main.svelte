<script>
	import { SvelteSet } from 'svelte/reactivity';

	let outside_basic = $state(false);
	let outside_basic_set = new SvelteSet();
	const throws_basic = $derived.by(() => {
		outside_basic_set.add(1);
		return outside_basic_set;
	})

	let inside_basic = $state(false);
	const works_basic = $derived.by(() => {
		let internal = new SvelteSet();
		internal.add(1);
		return internal;
	})

	let outside_has_delete = $state(false);
	let outside_has_delete_set = new SvelteSet([1]);
	const throws_has_delete = $derived.by(() => {
		outside_has_delete_set.has(1);
		outside_has_delete_set.delete(1);
		return outside_has_delete_set;
	})

	let inside_has_delete = $state(false);
	const works_has_delete = $derived.by(() => {
		let internal = new SvelteSet([1]);
		internal.has(1);
		internal.delete(1);
		return internal;
	})
</script>

<button onclick={() => (outside_basic = true)}>external</button>
{#if outside_basic}
	{throws_basic}
{/if}
<button onclick={() => (inside_basic = true)}>internal</button>
{#if inside_basic}
	{works_basic}
{/if}

<button onclick={() => (outside_has_delete = true)}>external</button>
{#if outside_has_delete}
	{throws_has_delete}
{/if}
<button onclick={() => (inside_has_delete = true)}>internal</button>
{#if inside_has_delete}
	{works_has_delete}
{/if}

