<script>
	import { fly } from 'svelte/transition';
</script>

<div transition:fly></div>
<div transition:fly|local></div>
<div transition:fly|global></div>
<div in:fly|local out:fly|global></div>
<div in:fly|global out:fly|local></div>
<svelte:element this={'div'} transition:fly|local></svelte:element>
