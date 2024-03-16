<!-- ok -->
<Button>
	hello
</Button>
<Button>
	{#snippet children()}hi{/snippet}
</Button>
<Button>
	hello
	{#snippet foo()}x{/snippet}
</Button>
<Button>
	{#snippet children()}hi{/snippet}
	{#snippet foo()}x{/snippet}
</Button>
<div>
	hello
	{#snippet children()}hi{/snippet}
</div>

<!-- invalid -->
<Button>
	hello
	{#snippet children()}hi{/snippet}
</Button>
