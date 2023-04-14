<script>
	const dynamicRole = "button";
</script>

<!-- valid -->
<button on:click={() => {}} />
<!-- svelte-ignore a11y-interactive-supports-focus -->
<div on:keydown={() => {}} role="button" />
<input type="text" on:click={() => {}} />
<div on:copy={() => {}} />
<a href="/foo" on:click={() => {}}>link</a>
<div role={dynamicRole} on:click={() => {}} />
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<footer on:keydown={() => {}} />

<!-- invalid -->
<div on:keydown={() => {}} />
<!-- svelte-ignore a11y-missing-attribute -->
<a on:mousedown={() => {}} on:mouseup={() => {}} on:copy={() => {}}>link</a>
