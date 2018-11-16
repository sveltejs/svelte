let current_component;

export function set_current_component(component) {
	current_component = component;
}

export function onprops(fn) {
	current_component.$$onprops.push(fn);
}

export function onmount(fn) {
	current_component.$$onmount.push(fn);
}

export function onupdate(fn) {
	current_component.$$onupdate.push(fn);
}

export function ondestroy(fn) {
	current_component.$$ondestroy.push(fn);
}