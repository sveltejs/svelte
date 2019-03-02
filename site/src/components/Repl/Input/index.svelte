<script>
	import ComponentSelector from './ComponentSelector.svelte';
	import ModuleEditor from './ModuleEditor.svelte';

	export let error;
	export let errorLoc;
	export let warnings; // TODO use context
</script>

<ComponentSelector/>

<ModuleEditor {error} {errorLoc} {warnings}/>