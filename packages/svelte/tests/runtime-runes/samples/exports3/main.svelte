<script>
	import Sub from './sub.svelte'
	let sub = $state();
</script>

<Sub bind:this={sub} />
<button on:click={() => sub.increment()}>{sub?.count1.value} / {sub?.count2.value}</button>
