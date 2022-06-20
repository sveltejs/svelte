<script>
	export let things;
	export let selected;
</script>

{#each things as thing}
	<div class:selected="{selected === thing}"></div>
{/each}