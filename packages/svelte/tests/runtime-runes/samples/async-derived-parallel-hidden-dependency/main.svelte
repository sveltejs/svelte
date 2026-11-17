<script lang="ts">
	import Store from './Store.svelte';
	import Member from './Member.svelte';
	import Default from './Default.svelte';
	import ArrayDefault from './ArrayDefault.svelte';
	import Class from './Class.svelte';
	import ShadowedEffect from './ShadowedEffect.svelte';
	import FunctionDerived from './FunctionDerived.svelte';
	import NamedFunction from './NamedFunction.svelte';
</script>

<!-- each of these reads a preceding async derived in a way that isn't directly visible, so they can't run in parallel -->
<Store />
<Member />
<Default />
<ArrayDefault />
<Class />
<ShadowedEffect />
<FunctionDerived />
<NamedFunction />
