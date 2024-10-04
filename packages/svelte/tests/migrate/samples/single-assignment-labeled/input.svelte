<script>
	let count = 0;
	let double;
	$:{
		double = count * 2;
	}
	
	let quadruple;
	$:{
		quadruple = count * 4;
		console.log("i have a side effect")
	}

	let eight_times;
	$:{
		// updated
		eight_times = count * 8;
	}

	let sixteen_times;
	$:{
		// reassigned outside labeled statement
		sixteen_times = count * 16;
	}

	let alot_times;
	$:{
		// reassigned in multiple labeled
		alot_times = count * 32;
	}
	$:{
		// reassigned in multiple labeled
		alot_times = count * 32;
	}

	let evenmore;
	let evenmore_doubled;
	$:{
		// multiple stuff in label
		evenmore = count * 64;
		evenmore_doubled = evenmore * 2;
	}

	let almost_infinity;
	$: almost_infinity = count * 128;

	let should_be_state;
	$: should_be_state = 42;
	$: should_be_state_too = 42;
</script>

<button on:click={()=>{
	count++;
	eight_times++;
	sixteen_times += 1;
	should_be_state_too++;
}}>click</button>