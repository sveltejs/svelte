<script>
	import Button from './Child.svelte';

	async function getFoo() {
		return 'foo';
	}

	const foo = $derived(await getFoo());
</script>

{foo}
<Button onclick={() => foo} />
