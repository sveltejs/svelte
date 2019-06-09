<script>
	import Button from './Button.svelte';
	const doThat = () => {};
</script>

<Button on:click|preventDefault={doThat}></Button>