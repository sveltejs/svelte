<script>
	export let maybe;
	export let raw;
</script>

<div>{#if maybe}after{/if}{@html raw}</div>
