<script>
	import Nested from './Nested.svelte';

	export let show;
	export let fields;
</script>

<div>
	<Nested {show} {fields}/>
</div>