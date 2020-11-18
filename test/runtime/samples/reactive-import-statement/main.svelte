<script>
	import { numbers } from './data.js';
	const local_numbers = [1, 2, 3, 4];

	function addNumber() {
		numbers[numbers.length] = numbers.length + 1;
		local_numbers[local_numbers.length] = local_numbers.length + 1;
	}

	$: sum = numbers.reduce((t, n) => t + n, 0);
	$: local_sum = local_numbers.reduce((t, n) => t + n, 0);
</script>

import <p>{numbers.join(' + ')} = {sum}</p>
local <p>{local_numbers.join(' + ')} = {local_sum}</p>

<button on:click={addNumber}>
	Add a number
</button>