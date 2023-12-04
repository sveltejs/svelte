<script>
	let clickHandler;
	let number = 0;
	
	function updateHandler1(){
		clickHandler = () => number = 1;
	}

	function updateHandler2(){
		clickHandler = () => number = 2;
	}
	

</script>

<p>
<button on:click={updateHandler1}>set handler 1</button>
<button on:click={updateHandler2}>set handler 2</button>
</p>

<p>{ number }</p>

<button on:click={clickHandler}>click</button>