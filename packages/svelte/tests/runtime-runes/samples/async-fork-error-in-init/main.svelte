<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
	let f: Fork | null = null;
</script>

<button onclick={() => (f = fork(() => (show = true)))}>fork</button>
<button onclick={() => f?.commit()}>commit</button>

<div id="output">
	<svelte:boundary>
		{#if show}
			<Child />
		{/if}

		{#snippet failed()}
			<p>failed</p>
		{/snippet}
	</svelte:boundary>
</div>
