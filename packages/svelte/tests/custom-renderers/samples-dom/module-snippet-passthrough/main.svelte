<script>
	import { greeting } from './DomSource.svelte';
	import DomChild from './DomChild.svelte';
</script>

<div>
	<DomChild {greeting}></DomChild>
</div>
