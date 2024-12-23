import { Key, Props, ReactElementType } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';

// 节点类型：jsx、ReactElement、fiberNode、DOMElement
// jsx -> ReactElement 转化
// ReactElement 与 fiberNode 比较并产生标记也就是 fiberTags
// 比较完成后生成 fiberNode 树（current、workInProgress）
// workInProgress 比较完成后最终生成当前 UI 对应的 fiber 树

export class FiberNode {
	tag: WorkTag;
	key: Key;
	stateNode: any;
	type: any | null;

	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	index: number;

	ref: any;

	memorizedProps: Props | null;
	memorizedState: Props | null;
	pendingProps: Props;
	updateQueue: unknown;

	alternate: FiberNode | null;
	flags: Flags;
	subtreeFlags: Flags;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// 实例
		this.tag = tag;
		this.key = key;
		this.stateNode = null;
		this.type = null;

		// 树状结构
		// 返回父 fiber 节点
		this.return = null;
		// 兄弟节点
		this.sibling = null;
		// 子节点
		this.child = null;
		// 索引
		this.index = 0;

		this.ref = null;

		// 工作单元
		this.memorizedProps = null;
		this.memorizedState = null;
		this.pendingProps = pendingProps;
		this.updateQueue = null;

		this.alternate = null;
		// 副作用
		this.flags = NoFlags;
		this.subtreeFlags = NoFlags;
	}
}

// reactDOM.createRoot(rootElement).render(<App/>)
// fiberRootNode ⇆⇆⇆ hostRoot ⇆⇆⇆ app
export class FiberRootNode {
	container: Container;
	finishedWork: FiberNode | null;
	current: FiberNode;

	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

// fiberRootNode WorkInProgress
export const createWorkInProgressFiber = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	let wip = current.alternate;
	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;

		wip.alternate = current;
		current.alternate = wip;
	} else {
		// update
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
		wip.subtreeFlags = NoFlags;
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memorizedProps = current.memorizedProps;
	wip.memorizedState = current.memorizedState;
	wip.ref = current.ref;

	return wip;
};
export function createFiberFromElement(element: ReactElementType) {
	const { type, key, props } = element;

	let fiberTag: WorkTag = FunctionComponent;

	// <div/> type: 'div'
	if (typeof type === 'string') {
		fiberTag = HostComponent;
	} else if (typeof type !== 'function') {
		console.error('fiber 节点类型');
	}

	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;

	return fiber;
}
