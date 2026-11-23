<script>
	let files = $state();
</script>

<form>
	<input type="file" bind:files />
</form>

<p>{files ? Array.from(files, (file) => file.name).join(',') || 'empty' : 'none'}</p>
