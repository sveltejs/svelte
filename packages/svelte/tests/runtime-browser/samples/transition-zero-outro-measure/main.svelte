<script lang="ts">
	import { slide } from 'svelte/transition';

	let visible = $state(true);
	let top = $state<number>();

	function measure(node: HTMLElement) {
		top = node.getBoundingClientRect().top;
		return { duration: 1000 };
	}
</script>

<button onclick={() => (visible = !visible)}>toggle</button>

{#if visible}
	<div style="height: 100px" out:slide={{ duration: 0 }}>first</div>
{/if}
{#if visible}
	<div out:measure>second</div>
{/if}

<output>{top}</output>
