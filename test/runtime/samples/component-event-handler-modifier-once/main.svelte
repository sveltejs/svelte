<script>
	import Button from './Button.svelte';
	export let count = 0;
</script>

<Button on:click|once="{() => count += 1}">{count}</Button>