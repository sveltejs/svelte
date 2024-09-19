<script module>
	export const object = $state({
		ok: true
	});

	export let primitive = $state('nope');

	export function update_object() {
		object.ok = !object.ok;
	}

	export function update_primitive() {
		primitive = 'yep';
	}
</script>
