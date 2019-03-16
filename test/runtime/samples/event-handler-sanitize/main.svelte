<script>
	export let visible;
</script>

<div on:some-event='{() => visible = !visible}'>toggle</div>

{#if visible}
	<p>hello!</p>
{/if}
