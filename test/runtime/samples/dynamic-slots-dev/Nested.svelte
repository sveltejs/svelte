<script>
  let slot = 'dynamic-slot';

	const f = () => {
		slot = 'thing';
	}
</script>

<div>
  <slot name={slot} />
  <slot />
  <slot name='static' />
</div>
