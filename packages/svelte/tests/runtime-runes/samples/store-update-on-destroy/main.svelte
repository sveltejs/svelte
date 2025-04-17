<script lang="ts">
	import { writable } from 'svelte/store';

	import Test from './Test.svelte';

	let store = writable(0);

	let checked = $state(true);
</script>

<input type="checkbox" bind:checked />

{#if checked}
	<Test {store} />
{/if}
