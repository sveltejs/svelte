<svelte:options runes={true} />

<script context="module">
	const o = 'o';
	const d = 'd';
</script>

<script>
	let boolean = false;
	let value = 'd';
	value += 'd';
</script>

<p autocapitalize="w{o}r{d}s" itemid="w{o}r{value}s" contenteditable={boolean}>boolean is {boolean} and autocapitalize is w{o}r{d}s</p>
