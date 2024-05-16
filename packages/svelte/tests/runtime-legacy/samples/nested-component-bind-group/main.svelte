<script>
	import Flavour from "./Flavour.svelte"
	let menu = [
		'Cookies and cream',
		'Mint choc chip',
		'Raspberry ripple'
	];
        let selection = [];
        $: console.log(selection)
</script>

{#each menu as flavour}
	<Flavour {flavour} bind:group={selection} />
{/each}
