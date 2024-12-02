<svelte:options runes={true} />

<!-- svelte-ignore a11y-missing-attribute -->
<div>
	<img src="this-is-fine.jpg">
</div>

<!-- svelte-ignore ally_missing_attribute -->
<div>
	<img src="this-is-fine.jpg">
</div>

<!-- svelte-ignore a11y-misplaced-scope -->
<div scope></div>

<!-- svelte-ignore a11y_misplaced_scope this is some prose -->
<div scope></div>

<!-- svelte-ignore a11y_misplaced_scope this_is some-ambiguous prose -->
<div scope></div>
