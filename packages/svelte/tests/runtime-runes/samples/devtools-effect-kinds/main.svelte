<script>
	import { onMount } from 'svelte';

	let { probe } = $props();
	let el = $state();

	$effect(() => probe('$effect'));
	$effect.pre(() => probe('$effect.pre'));
	onMount(() => probe('onMount'));

	/** @param {Element} node */
	function action(node) {
		probe('action');
	}

	/** @param {Element} node */
	function fade(node) {
		probe('transition');
		return { duration: 0 };
	}
</script>

<div use:action {@attach () => probe('attachment')} bind:this={el} in:fade|global></div>
