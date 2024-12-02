<script>
	let {children} = $props()
	let innerText = $state()
	$inspect(innerText);
</script>

<div contenteditable="true" bind:innerHTML={innerText}>
	{@render children()}
</div>
