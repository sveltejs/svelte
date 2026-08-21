<script>
	import { Spring } from 'svelte/motion';

	let outside_basic = $state(false);
	let outside_basic_spring = new Spring(0);
	const throws_basic = $derived.by(() => {
		outside_basic_spring.set(1);
		return outside_basic_spring;
	})

	let inside_basic = $state(false);
	const works_basic = $derived.by(() => {
		let internal = new Spring(0);
		internal.set(1);
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