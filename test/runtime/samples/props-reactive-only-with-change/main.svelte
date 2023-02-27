<script>
	import Comp from './Comp.svelte';
	export let callback;
	export let val1, val2;
</script>

<Comp id="1" {callback} value={val1} />
<Comp id="2" {callback} value={val2} />