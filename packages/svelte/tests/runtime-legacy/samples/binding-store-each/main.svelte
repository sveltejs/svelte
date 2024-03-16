<script>
	import { derived, writable } from "svelte/store";

	const checks = writable([false, false, false])
	const countChecked = derived(checks, ($checks) => $checks.filter(Boolean).length)
</script>

{#each $checks as checked}
	<input type="checkbox" bind:checked />
{/each}

{$countChecked}
