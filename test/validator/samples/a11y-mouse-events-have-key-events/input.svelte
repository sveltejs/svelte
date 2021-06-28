<script>
	// Even if otherProps contains onBlur and/or onFocus, the rule will still fail.
	// Props should be passed down explicitly for rule to pass.
	const otherProps = {
		onBlur: () => void 0,
		onFocus: () => void 0,
	};
</script>

<div on:mouseover={() => void 0} />
<div on:mouseover={() => void 0} on:focus={() => void 0} />
<div on:mouseover={() => void 0} {...otherProps} />
<div on:mouseout={() => void 0} />
<div on:mouseout={() => void 0} on:blur={() => void 0} />
<div on:mouseout={() => void 0} {...otherProps} />
