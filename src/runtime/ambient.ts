declare module '*.svelte' {
	type Props = Record<string, any>;

	export default class {
		constructor(options: {
			target: Element;
			anchor?: Element;
			props?: Props;
			hydrate?: boolean;
			intro?: boolean;
		});

		$set(props: Props): void;
		$on<T = any>(event: string, callback: (event: CustomEvent<T>) => void): () => void;
		$destroy(): void;

		[accessor: string]: any;
	}
}
