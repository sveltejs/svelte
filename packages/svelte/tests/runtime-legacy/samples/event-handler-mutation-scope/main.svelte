<script>
	export let log = [];
	let referenced_directly = 0;
	let not_referenced_directly = 0;
	let css_based_on_not_referenced = '';

	function click() {
		referenced_directly += 1;
		not_referenced_directly += 1;
		css_based_on_not_referenced = not_referenced_directly % 2 == 1 ? 'background-color: red' : '';
		log.push(referenced_directly + ' - ' + not_referenced_directly); //only referenced_directly is increasing
	}
</script>

<button on:click={click} style={css_based_on_not_referenced}> increase both </button>
{referenced_directly}
