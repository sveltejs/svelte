<script>
	let { values } = $props();
</script>

<div
	data-decimal={values.decimal}
	data-zero={values.zero}
	data-same={values.same}
	data-nan={values.nan}
	data-large={values.large}
	data-yes={values.yes}
	data-no={values.no}
	aria-hidden={values.hidden}
	aria-checked={values.checked}
	data-empty={values.empty}
	data-gone={values.gone}
></div>
