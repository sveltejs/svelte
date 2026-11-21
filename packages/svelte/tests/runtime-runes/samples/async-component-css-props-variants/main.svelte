<script lang="ts">
	import Child from './Child.svelte';
	import SvgChild from './SvgChild.svelte';

	let show = $state(true);

	await Promise.resolve();
	let width = $state('10rem');
	let Component = $state(Child);
</script>

<button onclick={() => width = '20rem'}>resize</button>
<button onclick={() => show = false}>hide</button>

<output>
	<span>before</span>
	{#if show}
		<Child --width="10rem" value={width} />
		<Component --width={await Promise.resolve(width)} />
		<div><svg><SvgChild --width={width} /></svg></div>
		{#each await Promise.resolve([1]) as item (item)}
			<Child --width={width} />
		{/each}
	{/if}
	<span>after</span>
</output>
