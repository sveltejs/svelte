export function createWorkspace() {
	let entries = $state({});
	$effect(() => {
		entries = /* @__PURE__ */ Object.create(null);
	});
	// keep current
	function current() {
		return entries;
	}
	return { current };
}

export function variants() {
	let entries = $state({});
	$effect.pre(() => {
		// removed pre effect
		entries = /* #__PURE__ */ Object.create(null);
	});
	$effect.root(() => {
		entries = /* @__PURE__ */ Object.create(null);
	});
	const cleanup = $effect.root(() => {
		// removed root effect
		entries = /* #__PURE__ */ Object.create(null);
	});
	$inspect(/* @__PURE__ */ Object.create(null)).with(() => {
		// removed inspector
	});
	// keep current
	function current() {
		return entries;
	}
	return { current, cleanup, empty: /* @__PURE__ */ Object.create(null) };
}

export function trace() {
	$inspect.trace(/* @__PURE__ */ String('trace'));
	return /* @__PURE__ */ Object.create(null);
}
