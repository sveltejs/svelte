<script lang="ts">
	import { slide, type TransitionConfig } from 'svelte/transition';

	let visible = $state(true);
	let top = $state<number>();

	function measure(node: HTMLElement) {
		top = node.getBoundingClientRect().top;
		return { duration: 1000 };
	}

	function empty(_node: HTMLElement, options: TransitionConfig | (() => undefined) | undefined) {
		return options;
	}
</script>

<button onclick={() => (visible = !visible)}>toggle</button>

{#if visible}
	<div style="height: 100px" out:slide={{ duration: 0 }}>first</div>
{/if}
{#if visible}
	<div out:measure>second</div>
{/if}

{#if visible}
	{#each [undefined, {}, () => undefined] as options}
		<span out:empty={options}></span>
	{/each}
{/if}

<output>{top}</output>
