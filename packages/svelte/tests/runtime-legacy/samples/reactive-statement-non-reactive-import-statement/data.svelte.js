export const obj = $state({
	prop: 42
});

export function update() {
	obj.prop += 1;
}

export function reset() {
	obj.prop = 42;
}
