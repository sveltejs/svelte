<script>
	export let raw;
	export let maybe;
</script>

<div>{@html raw}{#if maybe}after{/if}</div>
