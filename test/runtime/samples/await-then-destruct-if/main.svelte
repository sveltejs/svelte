<script>
	import { writable } from 'svelte/store';

	export let fail = 'incorrect'

	const object = writable(Promise.resolve({ result: true }))
	const array = writable(Promise.resolve([true]))
</script>

{#await $object then { result }}
	{#if result}
		correct
	{:else}
		{fail}
	{/if}
{/await}

{#await $array then [result]}
	{#if result}
		correct
	{:else}
		{fail}
	{/if}
{/await}
