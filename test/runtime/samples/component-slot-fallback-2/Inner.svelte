<script>
	import { model } from "./store.svelte";
	export let value = '';
</script>

<input bind:value={$model} />
{value}