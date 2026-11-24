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

export type RenderOutput = SyncRenderOutput & PromiseLike<SyncRenderOutput>;
