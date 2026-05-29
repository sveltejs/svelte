<script>
	import Masthead from './Masthead.svelte';
	import PageFooter from './PageFooter.svelte';

	let { gate } = $props();

	function delay(value) {
		return new Promise((resolve) => setTimeout(() => resolve(value), 0));
	}
</script>

<!--
	this component renders multiple sibling top-level nodes and suspends at the async
	`{#if}` between them. It also reads an async `gate` prop, so its effect re-runs.
	On re-run (REACTION_RAN already set) the later siblings must still advance the
	effect's `end` marker forward, otherwise they are orphaned on destroy.
-->
<Masthead />

{#if await delay(gate)}
	<main class="child-main">content</main>
{/if}

<PageFooter />
