<script>
	export let y;
</script>

<svelte:window bind:scrollY={y}/>

<p>scrolled to {y}</p>