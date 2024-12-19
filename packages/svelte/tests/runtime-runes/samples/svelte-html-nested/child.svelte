<script>
	let foo = $state('bar');
	let i = 0;
</script>

<button onclick={() => foo = 'nested'+i++}>change nested</button>
<svelte:html {foo} class="foo baz"></svelte:html>
