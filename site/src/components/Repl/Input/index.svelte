<script>
	import ComponentSelector from './ComponentSelector.svelte';
	import ModuleEditor from './ModuleEditor.svelte';

	export let error;
	export let errorLoc;
	export let warningCount;
</script>

<!-- TODO would be nice if events bubbled -->
<ComponentSelector
	on:create
	on:remove
	on:select
/>

<ModuleEditor
	{error}
	{errorLoc}
	{warningCount}
	on:change
	on:navigate
/>