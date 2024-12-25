import { FiberNode, FiberRootNode } from './fiber';
import {
	ChildDeletion,
	MutationMask,
	NoFlags,
	Placement,
	Update
} from './fiberFlags';
import {
	appendChildToContainer,
	commitTextUpdate,
	Container,
	Instance,
	removeChild,
	TextInstance
} from './hostConfig';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';

let nextEffect: FiberNode | null = null;

// 以DFS形式执行
export const commitMutationEffects = (finishedWork: FiberNode) => {
	nextEffect = finishedWork;

	while (nextEffect !== null) {
		// 向下遍历
		const child: FiberNode | null = nextEffect.child;

		if (
			(nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
			child !== null
		) {
			nextEffect = child;
		} else {
			// 向上遍历
			up: while (nextEffect !== null) {
				commitMutationEffectsOnFiber(nextEffect);
				const sibling: FiberNode | null = nextEffect.sibling;

				if (sibling !== null) {
					nextEffect = sibling;
					break up;
				}
				nextEffect = nextEffect.return;
			}
		}
	}
};

const commitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
	const flags = finishedWork.flags;

	if ((flags & Placement) !== NoFlags) {
		// 插入/移动
		commitPlacement(finishedWork);
		finishedWork.flags &= ~Placement;
	}
	if ((flags & ChildDeletion) !== NoFlags) {
		const deletions = finishedWork.deletions;

		if (deletions !== null) {
			deletions.forEach((childToDelete) => {
				commitDeletion(childToDelete);
			});
		}
		finishedWork.flags &= ~ChildDeletion;
	}
	if ((flags & Update) !== NoFlags) {
		commitUpdate(finishedWork);
		finishedWork.flags &= ~Update;
	}
};

const commitUpdate = (fiber: FiberNode) => {
	switch (fiber.tag) {
		case HostText:
			const text = fiber?.memoizedProps?.content;
			return commitTextUpdate(fiber.stateNode, text);
		default:
			break;
	}
};

function commitDeletion(childToDelete: FiberNode) {
	if (__DEV__) {
		console.log('删除DOM、组件unmount', childToDelete);
	}
	let firstHostFiber: FiberNode;

	commitNestedUnmounts(childToDelete, (unmountFiber) => {
		switch (unmountFiber.tag) {
			case HostComponent:
				if (!firstHostFiber) {
					firstHostFiber = unmountFiber;
				}
				// 解绑ref
				return;
			case HostText:
				if (!firstHostFiber) {
					firstHostFiber = unmountFiber;
				}
				return;
			case FunctionComponent:
				// effect相关操作
				return;
		}
	});

	// @ts-ignore
	if (firstHostFiber) {
		const hostParent = getHostParent(childToDelete) as Container;
		removeChild(firstHostFiber.stateNode, hostParent);
	}

	childToDelete.return = null;
	childToDelete.child = null;
}

function commitNestedUnmounts(
	root: FiberNode,
	onCommitUnmount: (unmountFiber: FiberNode) => void
) {
	let node = root;

	while (true) {
		onCommitUnmount(node);

		if (node.child !== null) {
			// 向下
			node.child.return = node;
			node = node.child;
			continue;
		}
		if (node === root) {
			// 终止条件
			return;
		}
		while (node.sibling === null) {
			// 向上
			if (node.return === null || node.return === root) {
				// 终止条件
				return;
			}
			node = node.return;
		}
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

const commitPlacement = (finishedWork: FiberNode) => {
	const hostParent = getHostParent(finishedWork) as Container;
	appendPlacementNodeIntoContainer(finishedWork, hostParent);
};

function appendPlacementNodeIntoContainer(fiber: FiberNode, parent: Container) {
	if (fiber.tag === HostComponent || fiber.tag === HostText) {
		appendChildToContainer(fiber.stateNode, parent);
		return;
	}
	const child = fiber.child;
	if (child !== null) {
		appendPlacementNodeIntoContainer(child, parent);
		let sibling = child.sibling;

		while (sibling !== null) {
			appendPlacementNodeIntoContainer(sibling, parent);
			sibling = sibling.sibling;
		}
	}
}

function getHostParent(fiber: FiberNode) {
	let parent = fiber.return;

	while (parent) {
		const parentTag = parent.tag;
		if (parentTag === HostComponent) {
			return parent.stateNode as Container;
		}
		if (parentTag === HostRoot) {
			return (parent.stateNode as FiberRootNode).container;
		}
		parent = parent.return;
	}
	console.error('getHostParent未找到hostParent');
}
