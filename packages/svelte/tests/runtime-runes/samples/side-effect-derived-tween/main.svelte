<script>
	import { Tween } from 'svelte/motion';

	let outside_basic = $state(false);
	let outside_basic_tween = new Tween(0);
	const throws_basic = $derived.by(() => {
		outside_basic_tween.set(1);
		return outside_basic_tween;
	})

	let inside_basic = $state(false);
	const works_basic = $derived.by(() => {
		let internal = new Tween(0);
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