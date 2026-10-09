export type Csp = { nonce?: string; hash?: boolean };

export type Sha256Source = `sha256-${string}`;

export interface SyncRenderOutput {
	/** HTML that goes into the `<head>` */
	head: string;
	/** @deprecated use `body` instead */
	html: string;
	/** HTML that goes somewhere into the `<body>` */
	body: string;
	hashes: {
		script: Sha256Source[];
	};
}

export interface AsyncRenderOutput extends SyncRenderOutput {
	/**
	 * `<script>` tags that must be written into the response after the rendered HTML, in order.
	 * When using `experimental.streaming`, these send the data loaded inside `<svelte:boundary>` elements
	 * with a `pending` snippet to the client as it becomes available. Otherwise, this is empty.
	 */
	tail: AsyncIterable<string>;
}

export type RenderOutput = SyncRenderOutput & PromiseLike<AsyncRenderOutput>;
