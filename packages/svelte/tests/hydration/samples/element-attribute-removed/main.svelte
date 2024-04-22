<script>
	export let id;
</script>

<!-- single update -->
<div id={id}></div>

{#if true}
	<!-- grouped updates -->
	<div id={id}></div>
	<div id={id}></div>
{/if}
