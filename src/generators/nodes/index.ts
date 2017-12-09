import Node from './shared/Node';
import AwaitBlock from './AwaitBlock';
import CatchBlock from './CatchBlock';
import Comment from './Comment';
import Component from './Component';
import EachBlock from './EachBlock';
import Element from './Element';
import ElseBlock from './ElseBlock';
import Fragment from './Fragment';
import IfBlock from './IfBlock';
import MustacheTag from './MustacheTag';
import PendingBlock from './PendingBlock';
import RawMustacheTag from './RawMustacheTag';
import Slot from './Slot';
import Text from './Text';
import ThenBlock from './ThenBlock';
import Window from './Window';

const nodes: Record<string, any> = {
	AwaitBlock,
	CatchBlock,
	Comment,
	Component,
	EachBlock,
	Element,
	ElseBlock,
	Fragment,
	IfBlock,
	MustacheTag,
	PendingBlock,
	RawMustacheTag,
	Slot,
	Text,
	ThenBlock,
	Window
};

export default nodes;