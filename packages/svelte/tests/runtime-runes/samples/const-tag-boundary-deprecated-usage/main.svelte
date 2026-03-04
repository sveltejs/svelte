<script>
	import FlakyComponent from "./FlakyComponent.svelte";
	let test=$state(1);
</script>

<button onclick={()=>test++}></button>

<svelte:boundary>
	{@const double = test * 2}
	{#snippet failed()}
		<p>{double}</p>
	{/snippet}
	<FlakyComponent />
</svelte:boundary>