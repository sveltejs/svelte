<script>
	export let objectProp;
	let count = 0;
	$: objectPropCopy = [...objectProp];

	$: incrementCount(), console.log('propDependencyChanged', objectProp);
	const incrementCount = () => {
		count++;
	};
	const clickAction = () => {
		//note that this file shouldn't be formatted and the trailing comment must be rightnext to the variable name
		// prettier-ignore
		objectPropCopy = objectPropCopy// trailing comment
	};
</script>

<button on:click={clickAction}>click me!</button>

{objectPropCopy}
<div id="render-count">{count}</div>
