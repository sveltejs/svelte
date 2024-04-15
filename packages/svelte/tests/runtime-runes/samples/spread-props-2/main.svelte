<script>
	let isRed = $state(true)

  const attributes = $derived({
    'data-red': isRed ? true : undefined
  });
</script>

<button onclick={() => isRed = !isRed }>Toggle</button>

<h1 {...attributes}>Style: {isRed ? 'red' : 'not red'}</h1>
