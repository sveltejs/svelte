<script lang="ts">
	import Slot from './Slot.svelte';

	let value = $state(0);
	const object = $state({ value: 0 });
	const plain = { value: '' };
</script>

{#snippet update()}
	{value++}
{/snippet}

{#snippet compound()}
	{value += 1}
{/snippet}

{#snippet member()}
	{object.value = 1}
{/snippet}

{#snippet destructuring()}
	{[value] = [1]}
{/snippet}

{#snippet attribute()}
	<div title={value = 1}></div>
{/snippet}

{#snippet spread()}
	<div {...(object.value = 1, {})}></div>
{/snippet}

{#snippet directive()}
	<div class:active={value = 1}></div>
{/snippet}

{#snippet argument()}
	{@render display(value = 1)}
{/snippet}

{#snippet display(value: number)}
	{value}
{/snippet}

{#snippet slot_property()}
	<Slot>
		{#snippet children(props)}
			{props.value}
		{/snippet}
	</Slot>
{/snippet}

{#snippet slot_spread()}
	<Slot spread>
		{#snippet children(props)}
			{props.value}
		{/snippet}
	</Slot>
{/snippet}

{#each [update, compound, member, destructuring, attribute, spread, directive, argument, slot_property, slot_spread] as variant}
	<svelte:boundary>
		{@render variant()}
		{#snippet failed(error)}
			<p class="error">{error.message.split('\n')[0]}</p>
		{/snippet}
	</svelte:boundary>
{/each}

<p class="stateless">{(/foo/.lastIndex = 1)}</p>
<p class="allowed">{plain.value = 'allowed'}</p>
<button onclick={() => value++}>increment</button>
<output>{value}:{object.value}</output>
