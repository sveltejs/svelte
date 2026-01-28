<script>
	let { ok = true } = $props();

	function throwError() {
	  throw new Error();
	}

	function throwErrorOnUpdate() {
		if (ok) {
			return "OK";
		} else {
			throwError();
		}
	}
</script>
  
<svelte:boundary>
	<div>{throwError()}</div>
  
	{#snippet failed()}
		<p>BOOM</p>
	{/snippet}
</svelte:boundary>

<svelte:boundary>
	{@const result = throwError()}
	<div>{result}</div>
  
	{#snippet failed()}
		<p>BOOM</p>
	{/snippet}
</svelte:boundary>

<svelte:boundary>
	<div>{throwErrorOnUpdate()}</div>
  
	{#snippet failed()}
		<p>BOOM</p>
	{/snippet}
</svelte:boundary>

<svelte:boundary>
	{@const result = throwErrorOnUpdate()}
	<div>{result}</div>
  
	{#snippet failed()}
		<p>BOOM</p>
	{/snippet}
</svelte:boundary>
