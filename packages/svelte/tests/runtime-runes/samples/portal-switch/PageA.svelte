<script>
	import { getPortalKey } from './main.svelte';
</script>

{#portal getPortalKey()}
	on page A
{/portal}

<p>contents of page A</p>
