{#if await true}
	<div
		{@attach (node) => {
			node.textContent = 'attachment ran';
		}}
	>
		attachment did not run
	</div>
{/if}
