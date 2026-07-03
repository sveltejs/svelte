<script>
	import { fork } from 'svelte';

	let show = $state(false);
</script>

<button onclick={async () => {
	fork(() => {
		show = true;
	}).commit();
}}>fork</button>

{#portal 'target'}
	portaled
{/portal}

{#if show}
	<div>{@portal 'target'}</div>
	<div>{@portal 'target'}</div>
{/if}
