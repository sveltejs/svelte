<svelte:options runes={true} />

<script context="module">
	const autocapitalize = 'words';
</script>

<script>
	let boolean = false;
</script>

<p {autocapitalize} contenteditable={boolean}>hello world</p>
