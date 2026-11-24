export function createWorkspace() {
	let entries = $state({});
	$effect(() => {
		entries = /* @__PURE__ */ Object.create(null);
	});
	function current() {
		return entries;
	}
	return { current };
}
