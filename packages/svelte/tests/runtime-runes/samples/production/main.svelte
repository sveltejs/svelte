<script>
    import { DEV } from "esm-env";
console.info("prod", DEV)
    if (DEV) {
        throw new Error("Dev-only code must not run");
    }
</script>