<script>
	import Sub from './sub.svelte'
	let sub
</script>

<Sub bind:this={sub} />
<button on:click={() => sub.increment()}>Increment</button>
<button on:click={() => sub.decrement()}>Decrement</button>
<button on:click={() => sub.double()}>Double</button>
