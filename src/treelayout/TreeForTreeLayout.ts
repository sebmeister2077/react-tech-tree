
/**
 * Represents a tree to be used by the {@link TreeLayout}.
 * <p>
 * The TreeForTreeLayout interface is designed to best match the implemented
 * layout algorithm and to ensure the algorithm's time complexity promises in
 * all possible cases. However in most situation a client must not deal with all
 * details of this interface and can directly use the
 * {@link org.abego.treelayout.util.AbstractTreeForTreeLayout} to implement this
 * interface or even use the
 * {@link org.abego.treelayout.util.DefaultTreeForTreeLayout} class directly.
 * </p>
 * Also see <a href="package-summary.html">this overview</a>.
 * 
 * @param <TreeNode> Type of elements used as nodes in the tree
 */
export interface TreeForTreeLayout<TreeNode> {

	/**
	 * Returns the the root of the tree.
	 * <p>
	 * Time Complexity: O(1)
	 * 
	 * @return the root of the tree
	 */
	 getRoot:()=>TreeNode;

	/**
	 * Tells if a node is a leaf in the tree.
	 * <p>
	 * Time Complexity: O(1)
	 * 
	 * @param node &nbsp;
	 * @return true iff node is a leaf in the tree, i.e. has no children.
	 */
	 isLeaf:(node:TreeNode)=>boolean;

	/**
	 * Tells if a node is a child of a given parentNode.
	 * <p>
	 * Time Complexity: O(1)
	 * 
	 * @param node &nbsp;
	 * @param parentNode &nbsp;
	 * @return true iff the node is a child of the given parentNode
	 */
	isChildOfParent:(node:TreeNode, parentNode:TreeNode)=>boolean;

	/**
	 * Returns the children of a parent node.
	 * <p>
	 * Time Complexity: O(1)
	 * 
	 * @param parentNode
	 *            [!isLeaf(parentNode)]
	 * @return the children of the given parentNode, from first to last
	 */
	getChildren:(parentNode:TreeNode)=>Array<TreeNode>;

	/**
	 * Returns the children of a parent node, in reverse order.
	 * <p>
	 * Time Complexity: O(1)
	 * 
	 * @param parentNode
	 *            [!isLeaf(parentNode)]
	 * @return the children of given parentNode, from last to first
	 */
	getChildrenReverse:(parentNode:TreeNode)=>Array<TreeNode>;

	/**
	 * Returns the first child of a parent node.
	 * <p>
	 * Time Complexity: O(1)
	 * 
	 * @param parentNode
	 *            [!isLeaf(parentNode)]
	 * @return the first child of the parentNode
	 */
	getFirstChild:( parentNode:TreeNode)=>TreeNode;

	/**
	 * Returns the last child of a parent node.
	 * <p>
	 * 
	 * Time Complexity: O(1)
	 * 
	 * @param parentNode
	 *            [!isLeaf(parentNode)]
	 * @return the last child of the parentNode
	 */
	getLastChild:( parentNode:TreeNode)=>TreeNode;
}