<script>
	import Button from './button.svelte';
	
	let value = $state(0);

	const props = {
		class: 'foo'
	};
</script>

<Button {...props} bind:value />
<button {...props} onclick={() => value++}>{value}</button>
