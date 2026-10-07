<script>
	const myTextBlock = $state({
		current: 'h'
	})

	const renderTag = $state("h1")

</script>

<svelte:element this={renderTag} contenteditable="plaintext-only" class="test" bind:textContent={myTextBlock.current}>
    {myTextBlock.current}
</svelte:element>