<script>
    import { DEV } from "esm-env";

    if (DEV) {
        throw new Error("Dev-only code must not run");
    }
</script>