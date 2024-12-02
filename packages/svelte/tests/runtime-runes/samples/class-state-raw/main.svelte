<script>
	const libFreezesObjects = true

	function someLibFunctionCreatingFroozenObject(value) {
		if(libFreezesObjects) {
			return Object.freeze({inner: value})
		} else {
			return {inner: value}
		}
	}

	function someLibFunctionReturningInner(wrapped) {
		return wrapped.inner
	}

	function atom(init = null) {
		let el = $state({value: someLibFunctionCreatingFroozenObject(init)})

		return {
			get value() {
				return someLibFunctionReturningInner(el.value)
			},
			set value(v) {
				el.value = someLibFunctionCreatingFroozenObject(v)
			},
		}
	}

	let val = atom('hello')
</script>

<input type="text" bind:value={val.value} />

<span>{val.value}</span>
