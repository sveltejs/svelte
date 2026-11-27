<script lang="ts">
	import { checkpoint, load } from './ReadSchedulingHelpers.js';

	const known = 21;
	const object = {
		get value() {
			return known;
		},
		read() {
			return known;
		}
	};

	const a = $derived(await load('local-accessor-gap', 'a', 1));
	const from_getter = object.value;
	const from_method = object.read();
	checkpoint('local-accessor-gap');
	const b = $derived(await load('local-accessor-gap', 'b', known));
</script>

<output>{a}/{from_getter}/{from_method}/{b}</output>
