<script>
	let dynamic = $state('x');
	let spread = $state('y');
	let inputType = $state('text');
	let props = $derived({type: inputType});
</script>

<input bind:value={dynamic} type={inputType}>
<input bind:value={spread} {...props}>
<p>{dynamic} / {spread}</p>

<button onclick={() => inputType = 'text'}>change to text</button>
<button onclick={() => inputType = 'number'}>change to number</button>
<button onclick={() => inputType = 'range'}>change to range</button>
