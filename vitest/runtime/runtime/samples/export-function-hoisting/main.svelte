<script>
	export function one () {
    two()
	}

	export function two () {
		return one()
	}
</script>

Compile plz
