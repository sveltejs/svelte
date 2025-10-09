<script>
	function onchange(event) {
		console.log('change', event.currentTarget.checked);
	}
</script>

<input type="checkbox" {onchange} />

<input type="checkbox" bind:checked={...[]} {onchange} />

<input type="checkbox" bind:checked={...[undefined, undefined]} {onchange} />

<input type="checkbox" bind:checked={...[null, null]} {onchange} />

<input type="checkbox" bind:checked={...{}} {onchange} />
