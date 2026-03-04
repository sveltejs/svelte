<script>
	let text = $state('A');
</script>

<input bind:value={() => text, (v) => text = v.toUpperCase()} />
<p>{text}</p>
