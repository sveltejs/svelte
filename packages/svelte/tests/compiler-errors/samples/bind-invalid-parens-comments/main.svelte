<script>
	let value = $state('');
</script>

<input bind:value={/* a */ ( /* b */ () => value, (v) => (value = v))} />
