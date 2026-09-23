<script>
	import Rename from './Rename.svelte';

	const n = 1;
</script>

<form name="createElement"><input /></form>
<object title="named later"></object>
<div data-n={n}></div>
<Rename step="both" />
<p data-n={n}></p>
<Rename step="object" />
<span data-n={n}></span>
