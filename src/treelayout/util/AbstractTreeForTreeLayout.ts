import { TreeForTreeLayout } from "../TreeForTreeLayout";

/**
 * Provides an easy way to implement the {@link org.abego.treelayout.TreeForTreeLayout} interface by
 * defining just two simple methods and a constructor.
 * <p>
 * To use this class the underlying tree must provide the children as a list
 * (see {@link #getChildrenList(Object)} and give direct access to the parent of
 * a node (see {@link #getParent(Object)}).
 * <p>
 * 
 * See also {@link DefaultTreeForTreeLayout}.
 * 
 * @param <TreeNode> Type of elements used as nodes in the tree
 */
export abstract class AbstractTreeForTreeLayout<TreeNode> implements
		TreeForTreeLayout<TreeNode> {

	/**
	 * Returns the parent of a node, if it has one.
	 * <p>
	 * Time Complexity: O(1)
	 * 
	 * @param node &nbsp;
	 * @return [nullable] the parent of the node, or null when the node is a
	 *         root.
	 */
	abstract getParent(node:TreeNode):TreeNode;

	/**
	 * Return the children of a node as a {@link List}.
	 * <p>
	 * Time Complexity: O(1)
	 * <p>
	 * Also the access to an item of the list must have time complexity O(1).
	 * <p>
	 * A client must not modify the returned list.
	 * 
	 * @param node &nbsp;
	 * @return the children of the given node. When node is a leaf the list is
	 *         empty.
	 */
	abstract getChildrenList(node:TreeNode):Array<TreeNode>;

	private readonly root:TreeNode;

	constructor(root:TreeNode) {
		this.root = root;
	}

	public  getRoot():TreeNode {
		return this.root;
	}

	public  isLeaf( node:TreeNode):boolean {
		return this.getChildrenList(node).length===0;
	}

	public  isChildOfParent( node:TreeNode,  parentNode:TreeNode):boolean {
		return this.getParent(node) == parentNode;
    }
    //@ts-ignore
	public getChildren(node:TreeNode): Iterable<TreeNode> {
		return this.getChildrenList(node);
	}

    //@ts-ignore
    public getChildrenReverse(node: TreeNode): never {
        throw new Error("Not implemented method")
		//return IterableUtil.createReverseIterable(this.getChildrenList(node));
	}

	public getFirstChild( parentNode:TreeNode):TreeNode {
		return this.getChildrenList(parentNode)[0];
	}

	public getLastChild( parentNode:TreeNode):TreeNode {
		return this.getChildrenList(parentNode).at(-1) as TreeNode;
	}
}