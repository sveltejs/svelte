<script>
	import { get, has, has_unset } from './main.svelte';

	const message = get();
</script>

<h1>{message}</h1>
{#if has()}
	<h2>it's me</h2>
{/if}
{#if !has_unset()}
	<h2>or not</h2>
{/if}
