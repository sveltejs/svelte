<script>
	export let props;
</script>

<slot value={props} data={Array.isArray(props) ? props[0] : props.a} />
