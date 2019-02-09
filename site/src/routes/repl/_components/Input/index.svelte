<script>
	import ComponentSelector from './ComponentSelector.svelte';
	import ModuleEditor from './ModuleEditor.svelte';

	export let component_store;
	export let selected_store;

	export let error;
	export let errorLoc;
	export let warningCount;
</script>

<!-- TODO would be nice if events bubbled -->
<ComponentSelector
	{component_store}
	{selected_store}
	on:create
	on:remove
	on:select
/>

<ModuleEditor
	component={$selected_store}
	{error}
	{errorLoc}
	{warningCount}
	on:change
	on:navigate
/>