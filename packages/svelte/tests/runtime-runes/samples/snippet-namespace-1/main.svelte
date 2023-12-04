<script>
	import Widget from './Widget.svelte'
</script>

<div>
	<Widget>
		{#snippet children()}
			<line x1="0" y1="0" x2="100" y2="100" />
		{/snippet}
	</Widget>
</div>
