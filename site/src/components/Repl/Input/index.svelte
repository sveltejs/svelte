<script>
	import ComponentSelector from './ComponentSelector.svelte';
	import ModuleEditor from './ModuleEditor.svelte';

	export let error;
	export let errorLoc;
	export let warningCount;
</script>

<ComponentSelector/>

<ModuleEditor
	{error}
	{errorLoc}
	{warningCount}
	on:change
/>