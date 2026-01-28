<script>
	function jssrc(src) {
		return 'data:text/javascript;base64, ' + btoa(src);
	}

	const scriptSrcs = [ 1, 2, 3 ]
		.map(n => jssrc(`document.getElementById('r${n}').innerText = '${n}';`));
</script>

<svelte:head>
	{#each scriptSrcs as src}
    	<script src={src} async defer></script>
	{/each}
</svelte:head>

<b id="r1">?</b><b id="r2">?</b><b id="r3">?</b>