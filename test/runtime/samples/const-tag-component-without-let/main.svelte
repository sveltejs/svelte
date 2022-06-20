<script>
	import Component from './Component.svelte';
	export let props = "dynamic";
</script>

<Component>
	<svelte:fragment slot="box1">
		{@const foo = "static"}
		{@const bar = props}
		<div>{foo} {bar}</div>
	</svelte:fragment>

	<svelte:fragment>
		{@const foo = "static"}
		{@const bar = props}
		<div>{foo} {bar}</div>
	</svelte:fragment>
</Component>

<Component>
	{@const foo = "static"}
	{@const bar = props}
	<div>{foo} {bar}</div>
</Component>
