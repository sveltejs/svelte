<script>
	// mutated, so should warn
	let state = {
		count: 0,
		attachment(){}
	};

	// unmutated, so should not warn
	let attachments = {
		foo() {},
		bar() {}
	};
</script>

<button onclick={()=>{
	state.count++;
}}>{state.count}</button>

<div {@attach state.attachment}></div>

<div {@attach attachments.foo}></div>
<div {@attach attachments.bar}></div>
