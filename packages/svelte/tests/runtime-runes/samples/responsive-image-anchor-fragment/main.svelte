<script>
	import Picture from './Picture.js';

	let show = $state(true);
</script>

{#if show}
	<div>
		{#if true}<Picture />{/if}
	</div>
{/if}
