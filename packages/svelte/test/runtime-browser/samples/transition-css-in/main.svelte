<script>
	import { onMount } from 'svelte';

	export let visible;

	let mounted = false;
	onMount(() => {
		mounted = true;
	});

	function foo(_) {
		return {
			duration: 50,
			css: (t) => {
				return `opacity: ${t}`;
			}
		};
	}

	function bar(_) {
		return {
			duration: 10,
			css: (t) => {
				return `translate: 0 ${0 - t * 10}px`;
			}
		};
	}
</script>

{#if visible}
	<div class="fading-div" in:foo />
{/if}

{#if !visible}
	<div class="fading-div" in:foo />
{/if}

<div id="animated-on-init" in:bar|global />

{#if mounted}
	<div id="animated-on-mount" in:foo />
{/if}
