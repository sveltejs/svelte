<script>
	const dynamicRole = "button";
</script>

<!-- valid -->
<button on:click={() => {}} />
<div on:keydown={() => {}} role="button" />
<input type="text" on:click={() => {}} />
<div on:copy={() => {}} />
<a href="/foo" on:click={() => {}}>link</a>
<div role={dynamicRole} on:click={() => {}} />
<!-- invalid -->
<div on:keydown={() => {}} />
<!-- svelte-ignore a11y-missing-attribute -->
<a on:mousedown={() => {}} on:mouseup={() => {}} on:copy={() => {}}>link</a>
