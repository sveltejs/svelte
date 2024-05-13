<script>
	const dynamicRole = "button";
</script>

<!-- valid -->
<button on:click={() => {}}></button>
<!-- svelte-ignore a11y_interactive_supports_focus -->
<div on:keydown={() => {}} role="button"></div>
<input type="text" on:click={() => {}} />
<div on:copy={() => {}}></div>
<a href="/foo" on:click={() => {}}>link</a>
<div role={dynamicRole} on:click={() => {}}></div>
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<footer on:keydown={() => {}}></footer>

<!-- invalid -->
<div on:keydown={() => {}}></div>
<!-- svelte-ignore a11y_missing_attribute -->
<a on:mousedown={() => {}} on:mouseup={() => {}} on:copy={() => {}}>link</a>
