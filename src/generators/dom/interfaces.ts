export interface State {
	namespace: string;
	parentNode: string;
	isTopLevel: boolean
	parentNodeName?: string;
	basename?: string;
	inEachBlock?: boolean;
	allUsedContexts?: string[];
	usesComponent?: boolean;
}