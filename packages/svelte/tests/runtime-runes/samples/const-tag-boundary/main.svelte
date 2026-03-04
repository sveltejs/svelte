<script>
	let count = $state(1);
</script>

<button onclick={()=>count++}>increment</button>

<svelte:boundary>
	{@const double = count * 2}
	<p>{double}</p>
</svelte:boundary>
