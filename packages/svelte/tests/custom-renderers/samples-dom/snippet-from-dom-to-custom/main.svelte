<script>
	import { greeting } from './DomComponent.svelte';
</script>

<div>
	{@render greeting('world')}
</div>
