
export enum Location{
    Top, Left, Bottom, Right
}

export enum AlignmentInLevel {
    Center, TowardsRoot, AwayFromRoot
}

/**
 * Used to configure the tree layout algorithm.
 * @param <TreeNode> Type of elements used as nodes in the tree
 */

export interface Configuration<TreeNode> {


	/**
	 * Identifies the sides of a rectangle (top, left, ...)
	 */
	location:Location


	/**
	 * Returns the position of the root node in the diagram.
	 * @return the position of the root node in the diagram
	 */
	getRootLocation():Location;

	/**
	 * Possible alignments of a node within a level (centered, towards or away
	 * from root)
	 */
	alignmentInLevel:AlignmentInLevel

	/**
	 * Returns the alignment of "smaller" nodes within a level.
	 * 
	 * @return the alignment of "smaller" nodes within a level
	 */
	getAlignmentInLevel():AlignmentInLevel;

	// ------------------------------------------------------------------------
	// gapBetweenLevels/Nodes

	/**
	 * Returns the size of the gap between subsequent levels.
	 * 
	 * @param nextLevel [nextLevel > 0]
	 * 
	 * @return the size of the gap between level (nextLevel-1) and nextLevel
	 *         [result >= 0]
	 */
	getGapBetweenLevels(nextLevel:number):number;

	/**
	 * Returns the size of the minimal gap of nodes within a level.
	 * @return the minimal size of the gap between node1 and node2 [result >= 0]
	 */
	getGapBetweenNodes(node1:TreeNode,node2: TreeNode):number;
}
