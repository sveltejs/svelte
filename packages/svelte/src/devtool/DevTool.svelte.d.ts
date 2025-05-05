// i'm here so type generation doesn't get mad
// TODO generate this file during type generation
export default DevTool;
type DevTool = {
	$on?(type: string, callback: (e: any) => void): () => void;
	$set?(props: $$ComponentProps): void;
};
declare const DevTool: import("svelte").Component<$$ComponentProps, {}, "">;

