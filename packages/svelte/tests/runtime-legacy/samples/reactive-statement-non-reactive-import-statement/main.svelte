<script>
	import { obj, update, reset } from './data.svelte.js';

	$: a = obj.prop;

	// svelte-ignore reactive_declaration_non_reactive_property
	$: b = obj.prop;
</script>

<p>{a}</p>
<p>{b}</p>
<button on:click={update}>update</button>
<button on:click={reset}>reset</button>
