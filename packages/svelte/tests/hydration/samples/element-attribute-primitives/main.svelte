<script>
	let { values, size = 24, spread, show, n = 1 } = $props();
</script>

<div
	tabindex={-1}
	data-same={values['data-same']}
	data-nan={values['data-nan']}
	data-large={values['data-large']}
	data-yes={values['data-yes']}
	data-no={values['data-no']}
	aria-hidden={values['aria-hidden']}
	data-decimal={values['data-decimal']}
	data-zero={values['data-zero']}
	aria-checked={values['aria-checked']}
	data-empty={values['data-empty']}
	aria-rowindex={values['aria-rowindex']}
	data-null={values['data-null']}
	data-undefined={values['data-undefined']}
	data-object={values['data-object']}
></div>
<svg width={size} height={size} stroke-width={1.5} viewBox="0 0 24 24"><rect x={1} /></svg>
<button {...spread}>x</button>
{#if show}
	<section data-n={n} tabindex={-1}></section>
{/if}
<p data-n={n}></p>
