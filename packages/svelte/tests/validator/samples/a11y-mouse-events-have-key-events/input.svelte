<script>
	const otherProps = {
		onblur: () => {},
		onfocus: () => {}
	};
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onmouseover={() => {}}></div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onmouseover={() => {}} onfocus={() => {}}></div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onmouseover={() => {}} {...otherProps}></div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onmouseout={() => {}}></div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onmouseout={() => {}} onblur={() => {}}></div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onmouseout={() => {}} {...otherProps}></div>
