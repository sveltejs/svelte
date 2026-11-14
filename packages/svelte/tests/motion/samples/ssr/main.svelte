<script>
	import { Spring, Tween, spring, tweened } from 'svelte/motion';

	let { mode, value, promises } = $props();
	const initial = mode === 'set' ? 0 : value;
	const tween = mode === 'of' ? Tween.of(() => value) : new Tween(initial);
	const motion_spring = mode === 'of' ? Spring.of(() => value) : new Spring(initial);
	const legacy_tween = tweened(0);
	const legacy_spring = spring(0);

	if (mode === 'set') {
		promises.push(
			tween.set(value),
			motion_spring.set(value),
			legacy_tween.set(value),
			legacy_spring.set(value)
		);
	}
</script>

<p>{tween.current} {tween.target} {motion_spring.current} {motion_spring.target} {$legacy_tween} {$legacy_spring}</p>
