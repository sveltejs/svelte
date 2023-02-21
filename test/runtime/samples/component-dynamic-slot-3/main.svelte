<script>
	import Nested from './Nested.svelte';
	export let paths = ["a", "b"];
</script>

<Nested value="_">
	{#if paths[0]}
		<svelte:fragment slot="folder">
			<Nested value={paths[0]}>
				{#if paths[1]}
					<svelte:fragment slot="folder">
						<Nested value={paths[1]}>
							{#if paths[2]}
								<svelte:fragment slot="folder">
									<Nested value={paths[2]}>
										{#if paths[3]}
											<svelte:fragment slot="folder">
												<Nested value={paths[3]}/>
											</svelte:fragment>
										{:else}
											<svelte:fragment slot="file">
												<div>#3 level</div>
											</svelte:fragment>
										{/if}
									</Nested>
								</svelte:fragment>
							{:else}
								<svelte:fragment slot="file">
									<div>#2 level</div>
								</svelte:fragment>
							{/if}
						</Nested>
					</svelte:fragment>
				{:else}
					<svelte:fragment slot="file">
						<div>#1 level</div>
					</svelte:fragment>
				{/if}
			</Nested>
		</svelte:fragment>
	{:else}
		<svelte:fragment slot="file">
			<div>#0 level</div>
		</svelte:fragment>
	{/if}
</Nested>
