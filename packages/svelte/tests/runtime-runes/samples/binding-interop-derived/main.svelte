<svelte:options runes={false} />

<script>
	import { writable } from 'svelte/store'
	import Comp from './Comp.svelte'

	const myStore = writable('')

</script>

<Comp>
	{#snippet children({ props })}
			<select {...props} bind:value={$myStore} >
				<option>A</option>
				<option>B</option>
				<option>C</option>
			</select>
	{/snippet}
</Comp>
