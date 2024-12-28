import { beginWork } from './beginWork';
import { commitMutationEffects } from './commitWork';
import { completeWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags } from './fiberFlags';
import { HostRoot } from './workTags';

let workInProgress: FiberNode | null = null;

export function scheduleUpdateOnFiber(fiber: FiberNode) {
	if (__DEV__) {
		console.log('开始schedule阶段', fiber);
	}
	const root = markUpdateLaneFromFiberToRoot(fiber);

	if (root === null) {
		return;
	}
	ensureRootIsScheduled(root);
}

// 找到 root
function markUpdateLaneFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	return null;
}

function ensureRootIsScheduled(root: FiberRootNode) {
	performSyncWorkOnRoot(root);
}

function performSyncWorkOnRoot(root: FiberRootNode) {
	// 初始化操作
	prepareFreshStack(root);

	// render阶段具体操作
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			console.error('workLoop发生错误', e);
			workInProgress = null;
		}
	} while (true);

	if (workInProgress !== null) {
		console.error('render阶段结束时wip不为null');
	}

	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;

	// 所有 fiber、wip、flag、合成事件 执行完成
	// commit阶段操作
	commitRoot(root);
}

// 开始插入/改变真实 dom
function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork;

	if (finishedWork === null) {
		return;
	}
	if (__DEV__) {
		console.log('开始commit阶段', finishedWork);
	}

	// 重置
	root.finishedWork = null;

	const subtreeHasEffect =
		(finishedWork.subtreeFlags & MutationMask) !== NoFlags;
	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

	if (subtreeHasEffect || rootHasEffect) {
		// 有副作用要执行

		// 阶段1/3:beforeMutation

		// 阶段2/3:Mutation
		commitMutationEffects(finishedWork);

		// Fiber Tree切换
		root.current = finishedWork;

		// 阶段3:Layout
	} else {
		// Fiber Tree切换
		root.current = finishedWork;
	}
}

function prepareFreshStack(root: FiberRootNode) {
	if (__DEV__) {
		console.log('render阶段初始化工作', root);
	}

	// 创建虚拟 dom 树
	workInProgress = createWorkInProgress(root.current, {});
}

function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

// 循环至最下层子节点
// root ---> 最下层子节点
function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber);
	// 执行完beginWork后，pendingProps 变为 memorizedProps
	fiber.memorizedProps = fiber.pendingProps;
	if (next === null) {
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
}

// 最下层子节点 ---> root
function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;

	do {
		const next = completeWork(node);

		if (next !== null) {
			workInProgress = next;
			return;
		}

		const sibling = node.sibling;
		if (sibling) {
			workInProgress = sibling;
			return;
		}
		node = node.return;
		workInProgress = node;
	} while (node !== null);
}
