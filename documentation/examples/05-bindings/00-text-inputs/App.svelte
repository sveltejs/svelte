<script>
	let name = '';
</script>

<input bind:value={name} placeholder="tapez votre nom" />
<p>Bonjour {name || 'étranger'} !</p>
