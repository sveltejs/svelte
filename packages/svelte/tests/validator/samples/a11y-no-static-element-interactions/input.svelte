<script>
	const dynamicRole = "button";
</script>

<!-- valid -->
<button on:click={() => {}}></button>
<!-- svelte-ignore a11y-interactive-supports-focus -->
<div on:keydown={() => {}} role="button"></div>
<input type="text" on:click={() => {}} />
<div on:copy={() => {}}></div>
<a href="/foo" on:click={() => {}}>link</a>
<div role={dynamicRole} on:click={() => {}}></div>
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<footer on:keydown={() => {}}></footer>

<!-- invalid -->
<div on:keydown={() => {}}></div>
<!-- svelte-ignore a11y-missing-attribute -->
<a on:mousedown={() => {}} on:mouseup={() => {}} on:copy={() => {}}>link</a>
