<script>
  let a = $state("");
</script>

<svelte:boundary>
	{@const x = a}
	{x}
	<FlakyComponent />
</svelte:boundary>
