<script>
	let handlerUndef;
	let handlerNull;
	let handlerInvalid;

	handlerUndef = undefined;
	handlerNull = null;
	handlerInvalid = 42;
</script>

<button on:click={handlerUndef}>undef</button>
<button on:click={handlerNull}>null</button>
<button on:click={handlerInvalid}>invalid</button>
