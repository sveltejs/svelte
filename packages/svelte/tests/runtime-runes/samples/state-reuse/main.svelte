<script>
	let foo = { value: 'a' }
	let state1 = $state(foo);
	let state2 = $state(foo);
</script>

<button onclick={() => {
		let new_state1 = {};
		let new_state2 = {};
		// This contains Symbol.$state and Symbol.$readonly and we can't do anything against it,
		// because it's called on the original object, not our state proxy
		Reflect.ownKeys(foo).forEach(k => {
			new_state1[k] = foo[k];
			new_state2[k] = foo[k];
		});
		new_state1.value = 'b';
		new_state2.value = 'b';
		// $.proxy will see that Symbol.$state exists on this object already, which shouldn't result in a stale value
		state1 = new_state1;
		// $.proxy can't look into Symbol.$state because of the frozen object
		state2 = Object.freeze(new_state2);
	}}
>
state1.value: {state1.value}
state2.value: {state2.value}
</button>


