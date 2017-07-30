export interface State {
	name?: string;
	namespace: string;
	parentNode: string;
	parentNodes: string;
	isTopLevel: boolean;
	parentNodeName?: string;
	basename?: string;
	inEachBlock?: boolean;
	allUsedContexts?: string[];
	usesComponent?: boolean;
	selectBindingDependencies?: string[];
}
