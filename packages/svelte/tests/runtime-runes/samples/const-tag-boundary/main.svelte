<script>
	import FlakyComponent from "./FlakyComponent.svelte";
	let test=$state(1);
</script>

<button onclick={()=>test++}></button>

<svelte:boundary>
	{@const double = test * 2}
	{#snippet failed()}
		{double}
	{/snippet}
	<FlakyComponent />
</svelte:boundary>