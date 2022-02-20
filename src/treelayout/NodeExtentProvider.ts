
/**
 * Provides the extent (width and height) of a tree node.
 * <p>
 * Also see <a href="package-summary.html">this overview</a>.
 * 
 * @param <TreeNode> Type of elements used as nodes in the tree
 */
export interface NodeExtentProvider<TreeNode> {
	/**
	 * Returns the width of the given treeNode.
	 * 
	 * @param treeNode  &nbsp;
	 * @return [result &gt;= 0]
	 */
	getWidth(treeNode:TreeNode):number;

	/**
	 * Returns the height of the given treeNode.
	 * 
	 * @param treeNode &nbsp;
	 * @return [result &gt;= 0]
	 */
    getHeight(treeNode:TreeNode):number;
}