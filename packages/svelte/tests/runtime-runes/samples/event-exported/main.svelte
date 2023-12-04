<script>
	import Sub from './sub.svelte'

	let button;
</script>

<Sub bind:this={button} />
<button on:click={() => button.increment()}>Increment</button>
