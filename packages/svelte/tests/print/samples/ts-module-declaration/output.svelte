<script lang="ts">
	declare module 'my-module'  {
		export interface MyInterface { name: string }
	}

	declare namespace MyNamespace  {
		export declare function myFunc(): void;
	}
</script>
