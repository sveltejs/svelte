<script>
	import { slide } from 'svelte/transition';
	let tag = 'div';
	function toggle() {
		tag = (tag) ? null : 'div';
	}
</script>

<button id="button" on:click={toggle}>toggle</button> TAG={tag}

<div id="container">
	<svelte:element this={tag} transition:slide={{duration:500}}>CONTENT</svelte:element>	
</div>
