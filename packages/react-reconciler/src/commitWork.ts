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

	if ((flags & Update) !== NoFlags) {
		// 更新
		commitUpdate(finishedWork);
		finishedWork.flags &= ~Update;
	}

	if ((flags & ChildDeletion) !== NoFlags) {
		// 删除
		const deletions = finishedWork.deletions;
		if (deletions !== null) {
			deletions.forEach((i) => {
				commitDeletion(i);
			});
		}
		commitUpdate(finishedWork);
		finishedWork.flags &= ~ChildDeletion;
	}
};

function commitDeletion(childToDelete: FiberNode) {
	let rootHostComponent: FiberNode | null = null;

	// 递归子树
	commitNestedComponent(childToDelete, (unmountFiber) => {
		switch (unmountFiber.tag) {
			case HostComponent:
				if (rootHostComponent === null) {
					rootHostComponent = unmountFiber;
				}
				return;
			case HostText:
				if (rootHostComponent === null) {
					rootHostComponent = unmountFiber;
				}
				return;
			case FunctionComponent:
				return;

			default:
				break;
		}
	});

	// 移除rootHostComponent的dom
	if (rootHostComponent !== null) {
		const hostParent = getHostParent(rootHostComponent) as any;
		if (hostParent !== null) {
			removeChild(rootHostComponent, hostParent);
		}
	}
	childToDelete.return = null;
	childToDelete.child = null;
}
function commitUpdate(finishedWork: FiberNode) {
	if (__DEV__) {
		console.log('更新DOM、文本节点内容', finishedWork);
	}
	switch (finishedWork.tag) {
		case HostText:
			const newContent = finishedWork.pendingProps.content;
			return commitTextUpdate(finishedWork.stateNode, newContent);
	}
	console.error('commitUpdate未支持的类型', finishedWork);
}

function removeChild(child: Instance | TextInstance, container: Container) {
	container.removeChild(child);
}

function commitNestedComponent(
	root: FiberNode,
	onCommitUnmount: (fiber: FiberNode) => void
) {
	let node = root;

	while (true) {
		onCommitUnmount(node);

		if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === root) {
			return;
		}

		while (node.sibling === null) {
			if (node.return === null || node.return === root) {
				return;
			}
			node = node.return;
		}

		node.sibling.return = node.return;
		node = node.sibling;
	}
}

const commitPlacement = (finishedWork: FiberNode) => {
	const hostParent = getHostParent(finishedWork) as FiberNode;
	let parentStateNode;
	switch (hostParent.tag) {
		case HostRoot:
			parentStateNode = (hostParent.stateNode as FiberRootNode).container;
			break;
		case HostComponent:
			parentStateNode = hostParent.stateNode;
	}

	// appendChild / insertBefore
	appendPlacementNodeIntoContainer(finishedWork, parentStateNode);
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
		if (parentTag === HostComponent || parentTag === HostRoot) {
			return parent;
		}
		parent = parent.return;
	}
	console.error('getHostParent未找到hostParent');
}
