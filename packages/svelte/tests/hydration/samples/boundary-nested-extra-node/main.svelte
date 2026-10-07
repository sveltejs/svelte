<svelte:boundary>
	<div>
		<svelte:boundary>
			<p>inner</p>
			{#snippet failed()}
				<p>inner failed</p>
			{/snippet}
		</svelte:boundary>
	</div>

	{#snippet failed()}
		<p>outer failed</p>
	{/snippet}
</svelte:boundary>
