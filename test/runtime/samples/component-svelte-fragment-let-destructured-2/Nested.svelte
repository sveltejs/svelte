<script>
	export let props;
</script>

<slot name="main" value={props} data={Array.isArray(props) ? props[0] : props.a} />
