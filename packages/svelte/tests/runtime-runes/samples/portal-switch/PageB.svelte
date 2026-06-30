<script>
	import { getPortalKey } from './main.svelte';
</script>

{#portal getPortalKey()}
	on page B
{/portal}

<p>contents of page B</p>
