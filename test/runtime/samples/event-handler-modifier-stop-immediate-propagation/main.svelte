<script>
	export let logs = [];

	export let click_1 = () => {
		logs.push('click_1');
	}

	export let click_2 = () => {
		logs.push('click_2');
	}

	export let click_3 = () => {
		logs.push('click_3');
	}
</script>

<button
	on:click={click_1}
	on:click|stopImmediatePropagation={click_2}
	on:click={click_3}>
	click me
</button>
