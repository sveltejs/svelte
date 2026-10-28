<script>
	import { flushSync } from 'svelte';

	let closing = $state(false);
	let open = $state(true);
	let other = $state(true);
	let blurs = $state(0);

	let nested_closing = $state(false);
	let outer = $state(true);
	let inner = $state(true);
	let nested_blurs = $state(0);

	$effect(() => {
		if (closing) {
			open = false;
			other = false;
		}
	});

	$effect(() => {
		if (nested_closing) {
			inner = false;
			outer = false;
		}
	});
</script>

<p>blurs: {blurs}</p>
<p>nested blurs: {nested_blurs}</p>

{#if open}
	<input
		onkeydown={(event) => {
			if (event.key === 'Escape') closing = true;
		}}
		onblur={() => {
			blurs += 1;
			flushSync();
		}}
	/>
{/if}

{#if other}
	<span>other</span>
{/if}

{#if outer}
	<div>
		{#if inner}
			<input
				onkeydown={(event) => {
					if (event.key === 'Escape') nested_closing = true;
				}}
				onblur={() => {
					nested_blurs += 1;
					flushSync();
				}}
			/>
		{/if}
	</div>
{/if}
