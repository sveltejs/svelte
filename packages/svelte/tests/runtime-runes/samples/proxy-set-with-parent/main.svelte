<script>
	function with_writes(initialState) {
	  const derive = $state(initialState)
	  return derive
	}

	let data = $state({ example: 'Example' })
	let my_derived = $derived(with_writes({ example: data.example }))

	$effect(() => {
		my_derived.example = 'Bar'
	});
</script>

<input bind:value={data.example} />
