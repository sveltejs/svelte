<script lang="ts">
	await 1;
	let b = true;
	let a = true;
</script>

{#if a}
	<div>
		{#if b}
			<p>hello</p>
		{/if}
	</div>
{/if}
