<div>
	<slot />
	<span>Hello</span>
</div>

<style>
	/* match */
	:global(input) + span { color: red; }
	:global(input) ~ span { color: red; }
	/* no match */
	:global(input) ~ p { color: red; }
</style>
