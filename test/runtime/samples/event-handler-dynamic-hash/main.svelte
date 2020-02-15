<script>
	let clickHandler = {};
	let number = 0;
	
	function updateHandler1(){
		clickHandler.f = () => number = 1;
	}

	function updateHandler2(){
		clickHandler.f = () => number = 2;
	}
	

</script>

<p>
<button on:click={updateHandler1}>set handler 1</button>
<button on:click={updateHandler2}>set handler 2</button>
</p>

<p>{ number }</p>

<button on:click={clickHandler.f}>click</button>