import Node from './shared/Node';
import Attribute from './Attribute';
import AwaitBlock from './AwaitBlock';
import Binding from './Binding';
import CatchBlock from './CatchBlock';
import Comment from './Comment';
import Component from './Component';
import EachBlock from './EachBlock';
import Element from './Element';
import ElseBlock from './ElseBlock';
import EventHandler from './EventHandler';
import Fragment from './Fragment';
import IfBlock from './IfBlock';
import MustacheTag from './MustacheTag';
import PendingBlock from './PendingBlock';
import RawMustacheTag from './RawMustacheTag';
import Ref from './Ref';
import Slot from './Slot';
import Text from './Text';
import ThenBlock from './ThenBlock';
import Transition from './Transition';
import Window from './Window';

const nodes: Record<string, any> = {
	Attribute,
	AwaitBlock,
	Binding,
	CatchBlock,
	Comment,
	Component,
	EachBlock,
	Element,
	ElseBlock,
	EventHandler,
	Fragment,
	IfBlock,
	MustacheTag,
	PendingBlock,
	RawMustacheTag,
	Ref,
	Slot,
	Text,
	ThenBlock,
	Transition,
	Window
};

export default nodes;