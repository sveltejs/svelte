<script>
	import { fade } from 'svelte/transition';

	let show = $state(false);
	let animate = $state(false);

	function maybe(node, animate) {
		if (animate) return fade(node);
	}
</script>

<button onclick={() => show = !show}>show</button><button onclick={() => animate = !animate}>animate</button>

{#switch show case true}
	<h1 transition:maybe={animate}>Hello {name}!</h1>
{/switch}
