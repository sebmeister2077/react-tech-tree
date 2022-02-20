import { AlignmentInLevel, Configuration, Location } from "./Configuration";
import { NodeExtentProvider } from "./NodeExtentProvider";
import { TreeForTreeLayout } from "./TreeForTreeLayout";
import { Point } from "./util/Point";
import { Rectangle } from "./util/Rectangle";
import { Contract } from './internal/util/Contract';
import { DumpConfiguration } from "./internal/DumpConfig";
import { StringUtil } from "./internal/util/StringUtil";
/**
 * Implements the actual tree layout algorithm.
 * <p>
 * The nodes with their final layout can be retrieved through
 * {@link #getNodeBounds()}.
 * </p>
 * See <a href="package-summary.html">this summary</a> to get an overview how to
 * use TreeLayout.
 * 
 * 
 * @param <TreeNode> Type of elements used as nodes in the tree
 */
class TreeLayout<TreeNode> {
	private readonly  tree: TreeForTreeLayout<TreeNode>;
	private readonly nodeExtentProvider: NodeExtentProvider<TreeNode>;
	private readonly configuration: Configuration<TreeNode>;

	private readonly useIdentity: boolean;
	private readonly mod: Map<TreeNode, number>;
	private readonly thread: Map<TreeNode, TreeNode>;
	private readonly prelim: Map<TreeNode, number>;
	private readonly change: Map<TreeNode, number>;
	private readonly shift: Map<TreeNode, number>;
	private readonly ancestor: Map<TreeNode, TreeNode>;
	private readonly number: Map<TreeNode, number>;
	private readonly positions: Map<TreeNode, Point>;

	constructor(tree: TreeForTreeLayout<TreeNode>,
		nodeExtentProvider: NodeExtentProvider<TreeNode>,
		configuration: Configuration<TreeNode>, useIdentity: boolean = false) {
		this.tree = tree;
		this.nodeExtentProvider = nodeExtentProvider;
		this.configuration = configuration;
		this.useIdentity = useIdentity;

		// if (this.#useIdentity) {
		// this.mod = new IdentityHashMap<TreeNode, Double>();
		// this.thread = new IdentityHashMap<TreeNode, TreeNode>();
		// this.prelim = new IdentityHashMap<TreeNode, Double>();
		// this.change = new IdentityHashMap<TreeNode, Double>();
		// this.shift = new IdentityHashMap<TreeNode, Double>();
		// this.ancestor = new IdentityHashMap<TreeNode, TreeNode>();
		// this.number = new IdentityHashMap<TreeNode, Integer>();
		// this.positions = new IdentityHashMap<TreeNode, Point2D>();
		// } else {
		this.mod = new Map<TreeNode, number>();
		this.thread = new Map<TreeNode, TreeNode>();
		this.prelim = new Map<TreeNode, number>();
		this.change = new Map<TreeNode, number>();
		this.shift = new Map<TreeNode, number>();
		this.ancestor = new Map<TreeNode, TreeNode>();
		this.number = new Map<TreeNode, number>();
		this.positions = new Map<TreeNode, Point>();
		// }

		let r: TreeNode = tree.getRoot();
		this.firstWalk(r, null);
		this.calcSizeOfLevels(r, 0);
		this.secondWalk(r, -this.getPrelim(r), 0, 0);
	}


	/**
	 * Returns the Tree the layout is created for.
	 * 
	 * @return the Tree the layout is created for
	 */
	getTree(): TreeForTreeLayout<TreeNode> {
		return this.tree;
	}


	/**
	 * Returns the {@link NodeExtentProvider} used by this {@link TreeLayout}.
	 * 
	 * @return the {@link NodeExtentProvider} used by this {@link TreeLayout}
	 */
	getNodeExtentProvider(): NodeExtentProvider<TreeNode> {
		return this.nodeExtentProvider;
	}

	private getNodeHeight(node: TreeNode): number {
		return this.nodeExtentProvider.getHeight(node);
	}

	private getNodeWidth(node: TreeNode): number {
		return this.nodeExtentProvider.getWidth(node);
	}

	private getWidthOrHeightOfNode(treeNode: TreeNode, returnWidth: boolean): number {
		return returnWidth ? this.getNodeWidth(treeNode) : this.getNodeHeight(treeNode);
	}

	/**
	 * When the level changes in Y-axis (i.e. root location Top or Bottom) the
	 * height of a node is its thickness, otherwise the node's width is its
	 * thickness.
	 * The thickness of a node is used when calculating the locations of the
	 * levels.
	 * 
	 * @param treeNode
	 * @return
	 */
	private getNodeThickness(treeNode: TreeNode): number {
		return this.getWidthOrHeightOfNode(treeNode, !this.isLevelChangeInYAxis());
	}

	/**
	 * When the level changes in Y-axis (i.e. root location Top or Bottom) the
	 * width of a node is its size, otherwise the node's height is its size.
	 * The size of a node is used when calculating the distance between two
	 * nodes.
	 * 
	 * @param treeNode
	 * @return
	 */
	private getNodeSize(treeNode: TreeNode): number {
		return this.getWidthOrHeightOfNode(treeNode, this.isLevelChangeInYAxis());
	}


	/**
	 * Returns the Configuration used by this {@link TreeLayout}.
	 * 
	 * @return the Configuration used by this {@link TreeLayout}
	 */
	getConfiguration(): Configuration<TreeNode> {
		return this.configuration;
	}

	private isLevelChangeInYAxis(): boolean {
		let rootLocation = this.configuration.getRootLocation();
		return rootLocation == Location.Top || rootLocation == Location.Bottom;
	}

	private getLevelChangeSign(): number {
		let rootLocation = this.configuration.getRootLocation();
		return rootLocation == Location.Bottom
			|| rootLocation == Location.Right ? -1 : 1;
	}

	// ------------------------------------------------------------------------
	// bounds

	private boundsLeft = Number.MAX_SAFE_INTEGER;
	private boundsRight = Number.MIN_SAFE_INTEGER;
	private boundsTop = Number.MAX_SAFE_INTEGER;
	private boundsBottom = Number.MIN_SAFE_INTEGER;

	private updateBounds(node: TreeNode, centerX: number, centerY: number): void {
		let width = this.getNodeWidth(node);
		let height = this.getNodeHeight(node);
		let left = centerX - width / 2;
		let right = centerX + width / 2;
		let top = centerY - height / 2;
		let bottom = centerY + height / 2;
		if (this.boundsLeft > left) {
			this.boundsLeft = left;
		}
		if (this.boundsRight < right) {
			this.boundsRight = right;
		}
		if (this.boundsTop > top) {
			this.boundsTop = top;
		}
		if (this.boundsBottom < bottom) {
			this.boundsBottom = bottom;
		}
	}

	/**
	 * Returns the bounds of the tree layout.
	 * The bounds of a TreeLayout is the smallest rectangle containing the
	 * bounds of all nodes in the layout. It always starts at (0,0).
	 * 
	 * @return the bounds of the tree layout
	 */
	getBounds(): Rectangle {
		return new Rectangle({
			x: 0,
			y: 0,
			width: this.boundsRight - this.boundsLeft,
			height: this.boundsBottom - this.boundsTop
		});
	}

	private readonly sizeOfLevel = new Array<number>();

	private calcSizeOfLevels(node: TreeNode, level: number): void {
		let oldSize: number;
		if (this.sizeOfLevel.length <= level) {
			this.sizeOfLevel.push(0);
			oldSize = 0;
		} else {
			oldSize = this.sizeOfLevel[level];
		}

		let size = this.getNodeThickness(node);
		if (oldSize < size) {
			this.sizeOfLevel[level] = size;
		}

		if (!this.tree.isLeaf(node)) {
			this.tree.getChildren(node).forEach((child: TreeNode) => {
				this.calcSizeOfLevels(child, level + 1);
			}, this);
		}
	}

	/**
	 * Returns the number of levels of the tree.
	 * 
	 * @return [level > 0]
	 */
	getLevelCount(): number {
		return this.sizeOfLevel.length;
	}

	/**
	 * Returns the size of a level.
	 * When the root is located at the top or bottom the size of a level is the
	 * maximal height of the nodes of that level. When the root is located at
	 * the left or right the size of a level is the maximal width of the nodes
	 * of that level.
	 * 
	 * @param level -;
	 * @return the size of the level [level >= 0 && level <&lt;> levelCount]
	 */
	getSizeOfLevel(level: number): number {
		Contract.checkArg(level >= 0, "level must be >= 0");
		Contract.checkArg(level < this.getLevelCount(), "level must be < levelCount");

		return this.sizeOfLevel[level];
	}


	/**
	 * The algorithm calculates the position starting with the root at 0. I.e.
	 * the left children will get negative positions. However we want the result
	 * to be normalized to (0,0).
	 * {@link NormalizedPosition} will normalize the position (given relative to
	 * the root position), taking the current bounds into account. This way the
	 * left most node bounds will start at x = 0, the top most node bounds at y
	 * = 0.
	 */

	static NormalizedPosition = class NormalizedPosition extends Point {
		private x_relativeToRoot: number;
		private y_relativeToRoot: number;
		private readonly parentInstance: TreeLayout<any>;

		constructor(x_relativeToRoot: number, y_relativeToRoot: number, parentInstance: TreeLayout<any>) {
			super(0, 0)//! check is this is ok
			this.x_relativeToRoot = x_relativeToRoot;
			this.y_relativeToRoot = y_relativeToRoot;
			this.parentInstance = parentInstance;
		}

		getX = (): number => {
			return this.x_relativeToRoot - this.parentInstance.boundsLeft;
		}

		private getBoundsLeft() {
			return
		}

		getY = (): number => {
			return this.y_relativeToRoot - this.parentInstance.boundsTop;
		}

		// never called from outside
		setLocation = (x_relativeToRoot: number, y_relativeToRoot: number): void => {
			this.x_relativeToRoot = x_relativeToRoot;
			this.y_relativeToRoot = y_relativeToRoot;
		}
	}

	private getMod(node: TreeNode): number {
		let d: number | undefined = this.mod.get(node);
		return d ?? 0;
	}

	private setMod(node: TreeNode, d: number): void {
		this.mod.set(node, d);
	}

	private getThread(node: TreeNode): TreeNode | null {
		let n: TreeNode | undefined = this.thread.get(node);
		return n ?? null;
	}

	private setThread(node: TreeNode, thread: TreeNode): void {
		this.thread.set(node, thread);
	}

	private getAncestor(node: TreeNode): TreeNode {
		let n: TreeNode | undefined = this.ancestor.get(node);
		return n ?? node;
	}

	private setAncestor(node: TreeNode, ancestor: TreeNode): void {
		this.ancestor.set(node, ancestor);
	}

	private getPrelim(node: TreeNode): number {
		let d: number | undefined = this.prelim.get(node);
		return d ?? 0;
	}

	private setPrelim(node: TreeNode, d: number): void {
		this.prelim.set(node, d);
	}

	private getChange(node: TreeNode): number {
		let d: number | undefined = this.change.get(node);
		return d ?? 0;
	}

	private setChange(node: TreeNode, d: number): void {
		this.change.set(node, d);
	}

	private getShift(node: TreeNode): number {
		let d: number | undefined = this.shift.get(node);
		return d ?? 0;
	}

	private setShift(node: TreeNode, d: number): void {
		this.shift.set(node, d);
	}

	/**
	 * The distance of two nodes is the distance of the centers of both noded.
	 * I.e. the distance includes the gap between the nodes and half of the
	 * sizes of the nodes.
	 * 
	 * @param v
	 * @param w
	 * @return the distance between node v and w
	 */
	private getDistance(v: TreeNode, w: TreeNode): number {
		let sizeOfNodes: number = this.getNodeSize(v) + this.getNodeSize(w);

		let distance = sizeOfNodes / 2
			+ this.configuration.getGapBetweenNodes(v, w);
		return distance;
	}

	private nextLeft(v: TreeNode): TreeNode | null {
		return this.tree.isLeaf(v) ? this.getThread(v) : this.tree.getFirstChild(v);
	}

	private nextRight(v: TreeNode): TreeNode | null {
		return this.tree.isLeaf(v) ? this.getThread(v) : this.tree.getLastChild(v);
	}

	/**
	 * 
	 * @param node
	 *            [tree.isChildOfParent(node, parentNode)]
	 * @param parentNode
	 *            parent of node
	 * @return
	 */
	private getNumber(node: TreeNode, parentNode: TreeNode): number | null {
		let n: number | undefined = this.number.get(node);
		if (n === undefined) {
			let i = 1;
			this.tree.getChildren(parentNode).forEach((child: TreeNode) => {
				this.number.set(child, i++);
			}, this);
			n = this.number.get(node);
		}

		return n ?? null;
	}

	/**
	 * 
	 * @param vIMinus
	 * @param v
	 * @param parentOfV
	 * @param defaultAncestor
	 * @return the greatest distinct ancestor of vIMinus and its right neighbor
	 *         v
	 */
	private ancestorFct(vIMinus: TreeNode, v: TreeNode, parentOfV: TreeNode,
		defaultAncestor: TreeNode): TreeNode {
		let ancestor: TreeNode = this.getAncestor(vIMinus);

		// when the ancestor of vIMinus is a sibling of v (i.e. has the same
		// parent as v) it is also the greatest distinct ancestor vIMinus and
		// v. Otherwise it is the defaultAncestor

		return this.tree.isChildOfParent(ancestor, parentOfV) ? ancestor
			: defaultAncestor;
	}

	private moveSubtree(wMinus: TreeNode, wPlus: TreeNode, parent: TreeNode,
		shift: number): void {

		let nr1 = this.getNumber(wPlus, parent)
		let nr2 = this.getNumber(wMinus, parent)

		if (nr1 === null || nr2 === null)
			return;


		let subtrees: number = nr1 - nr2;
		this.setChange(wPlus, this.getChange(wPlus) - shift / subtrees);
		this.setShift(wPlus, this.getShift(wPlus) + shift);
		this.setChange(wMinus, this.getChange(wMinus) + shift / subtrees);
		this.setPrelim(wPlus, this.getPrelim(wPlus) + shift);
		this.setMod(wPlus, this.getMod(wPlus) + shift);
	}

	/**
	 * In difference to the original algorithm we also pass in the leftSibling
	 * and the parent of v.
	 * <p>
	 * <b>Why adding the parameter 'parent of v' (parentOfV) ?</b>
	 * <p>
	 * In this method we need access to the parent of v. Not every tree
	 * implementation may support efficient (i.e. constant time) access to it.
	 * On the other hand the (only) caller of this method can provide this
	 * information with only constant extra time.
	 * <p>
	 * Also we need access to the "left most sibling" of v. Not every tree
	 * implementation may support efficient (i.e. constant time) access to it.
	 * On the other hand the "left most sibling" of v is also the "first child"
	 * of the parent of v. The first child of a parent node we can get in
	 * constant time. As we got the parent of v we can so also get the
	 * "left most sibling" of v in constant time.
	 * <p>
	 * <b>Why adding the parameter 'leftSibling' ?</b>
	 * <p>
	 * In this method we need access to the "left sibling" of v. Not every tree
	 * implementation may support efficient (i.e. constant time) access to it.
	 * However it is easy for the caller of this method to provide this
	 * information with only constant extra time.
	 * <p>
	 * <p>
	 * <p>
	 * In addition these extra parameters avoid the need for
	 * {@link TreeForTreeLayout} to include extra methods "getParent",
	 * "getLeftSibling", or "getLeftMostSibling". This keeps the interface
	 * {@link TreeForTreeLayout} small and avoids redundant implementations.
	 * 
	 * @param v
	 * @param defaultAncestor
	 * @param leftSibling
	 *            [nullable] the left sibling v, if there is any
	 * @param parentOfV
	 *            the parent of v
	 * @return the (possibly changes) defaultAncestor
	 */
	private apportion(v: TreeNode, defaultAncestor: TreeNode,
		leftSibling: TreeNode | null, parentOfV: TreeNode) {
		let w = leftSibling;
		if (w == null) {
			// v has no left sibling
			return defaultAncestor;
		}
		// v has left sibling w

		// The following variables "v..." are used to traverse the contours to
		// the subtrees. "Minus" refers to the left, "Plus" to the right
		// subtree. "I" refers to the "inside" and "O" to the outside contour.
		let vOPlus: TreeNode | null = v;
		let vIPlus: TreeNode = v;
		let vIMinus: TreeNode = w;
		// get leftmost sibling of vIPlus, i.e. get the leftmost sibling of
		// v, i.e. the leftmost child of the parent of v (which is passed
		// in)
		let vOMinus: TreeNode | null = this.tree.getFirstChild(parentOfV);

		let sIPlus: number = this.getMod(vIPlus);
		let sOPlus: number = this.getMod(vOPlus);
		let sIMinus: number = this.getMod(vIMinus);
		let sOMinus: number = this.getMod(vOMinus);

		let nextRightVIMinus = this.nextRight(vIMinus);
		let nextLeftVIPlus = this.nextLeft(vIPlus);

		while (nextRightVIMinus != null && nextLeftVIPlus != null) {
			vIMinus = nextRightVIMinus;
			vIPlus = nextLeftVIPlus;
			vOMinus = this.nextLeft(vOMinus as TreeNode);
			vOPlus = this.nextRight(vOPlus as TreeNode);
			this.setAncestor(vOPlus as TreeNode, v);
			let shift: number = (this.getPrelim(vIMinus) + sIMinus)
				- (this.getPrelim(vIPlus) + sIPlus)
				+ this.getDistance(vIMinus, vIPlus);

			if (shift > 0) {
				this.moveSubtree(this.ancestorFct(vIMinus, v, parentOfV, defaultAncestor),
					v, parentOfV, shift);
				sIPlus = sIPlus + shift;
				sOPlus = sOPlus + shift;
			}
			sIMinus = sIMinus + this.getMod(vIMinus);
			sIPlus = sIPlus + this.getMod(vIPlus);
			sOMinus = sOMinus + this.getMod(vOMinus as TreeNode);
			sOPlus = sOPlus + this.getMod(vOPlus as TreeNode);

			nextRightVIMinus = this.nextRight(vIMinus);
			nextLeftVIPlus = this.nextLeft(vIPlus);
		}

		if (nextRightVIMinus != null && this.nextRight(vOPlus as TreeNode) == null) {
			this.setThread(vOPlus as TreeNode, nextRightVIMinus);
			this.setMod(vOPlus as TreeNode, this.getMod(vOPlus as TreeNode) + sIMinus - sOPlus);
		}

		if (nextLeftVIPlus != null && this.nextLeft(vOMinus as TreeNode) == null) {
			this.setThread(vOMinus as TreeNode, nextLeftVIPlus);
			this.setMod(vOMinus as TreeNode, this.getMod(vOMinus as TreeNode) + sIPlus - sOMinus);
			defaultAncestor = v;
		}
		return defaultAncestor;
	}

	/**
	 * 
	 * @param v
	 *            [!tree.isLeaf(v)]
	 */
	private executeShifts(v: TreeNode): void {
		let shift: number = 0;
		let change: number = 0;

		this.tree.getChildrenReverse(v).forEach((w: TreeNode) => {
			change = change + this.getChange(w);
			this.setPrelim(w, this.getPrelim(w) + shift);
			this.setMod(w, this.getMod(w) + shift);
			shift = shift + this.getShift(w) + change;
		}, this)

	}

	/**
	 * In difference to the original algorithm we also pass in the leftSibling
	 * (see {@link #apportion(Object, Object, Object, Object)} for a
	 * motivation).
	 * 
	 * @param v
	 * @param leftSibling
	 *            [nullable] the left sibling v, if there is any
	 */
	private firstWalk(v: TreeNode, leftSibling: TreeNode | null): void {
		if (this.tree.isLeaf(v)) {
			// No need to set prelim(v) to 0 as the getter takes care of this.

			let w = leftSibling;
			if (w != null) {
				// v has left sibling

				this.setPrelim(v, this.getPrelim(w) + this.getDistance(v, w));
			}

		} else {
			// v is not a leaf

			let defaultAncestor = this.tree.getFirstChild(v);
			let previousChild: TreeNode | null = null;

			this.tree.getChildren(v).forEach((w: TreeNode) => {
				this.firstWalk(w, previousChild);
				defaultAncestor = this.apportion(w, defaultAncestor, previousChild,
					v);
				previousChild = w;
			}, this)



			this.executeShifts(v);
			let midpoint: number = (this.getPrelim(this.tree.getFirstChild(v)) + this.getPrelim(this.tree
				.getLastChild(v))) / 2.0;
			let w = leftSibling;
			if (w != null) {
				// v has left sibling

				this.setPrelim(v, this.getPrelim(w) + this.getDistance(v, w));
				this.setMod(v, this.getPrelim(v) - midpoint);

			} else {
				// v has no left sibling

				this.setPrelim(v, midpoint);
			}
		}
	}

	/**
	 * In difference to the original algorithm we also pass in extra level
	 * information.
	 * 
	 * @param v
	 * @param m
	 * @param level
	 * @param levelStart
	 */
	private secondWalk(v: TreeNode, m: number, level: number, levelStart: number): void {
		// construct the position from the prelim and the level information

		// The rootLocation affects the way how x and y are changed and in what
		// direction.
		let levelChangeSign: number = this.getLevelChangeSign();
		let levelChangeOnYAxis: boolean = this.isLevelChangeInYAxis();
		let levelSize: number = this.getSizeOfLevel(level);

		let x: number = this.getPrelim(v) + m;

		let y: number;
		let alignment: AlignmentInLevel = this.configuration.getAlignmentInLevel();
		if (alignment == AlignmentInLevel.Center) {
			y = levelStart + levelChangeSign * (levelSize / 2);
		} else if (alignment == AlignmentInLevel.TowardsRoot) {
			y = levelStart + levelChangeSign * (this.getNodeThickness(v) / 2);
		} else {
			y = levelStart + levelSize - levelChangeSign
				* (this.getNodeThickness(v) / 2);
		}

		if (!levelChangeOnYAxis) {
			let t: number = x;
			x = y;
			y = t;
		}

		this.positions.set(v, new TreeLayout.NormalizedPosition(x, y, this));

		// update the bounds
		this.updateBounds(v, x, y);

		// recurse
		if (!this.tree.isLeaf(v)) {
			let nextLevelStart: number = levelStart
				+ (levelSize + this.configuration.getGapBetweenLevels(level + 1))
				* levelChangeSign;

			this.tree.getChildren(v).forEach((w: TreeNode) => {
				this.secondWalk(w, m + this.getMod(v), level + 1, nextLevelStart);
			})
		}
	}

	// ------------------------------------------------------------------------
	// nodeBounds

	private nodeBounds: Map<TreeNode, Rectangle> | null = null;

	/**
	 * Returns the layout of the tree nodes by mapping each node of the tree to
	 * its bounds (position and size).
	 * <p>
	 * For each rectangle x and y will be &gt;= 0. At least one rectangle will have
	 * an x == 0 and at least one rectangle will have an y == 0.
	 * 
	 * @return maps each node of the tree to its bounds (position and size).
	 */
	getNodeBounds(): Map<TreeNode, Rectangle> {
		if (this.nodeBounds == null) {
			this.nodeBounds = //todo this.useIdentity ? new IdentityHashMap<TreeNode, Rectangle>():
				new Map<TreeNode, Rectangle>();

			this.positions.forEach((val: Point, key: TreeNode) => {
				let node: TreeNode = key;
				let pos: Point = val;
				let w = this.getNodeWidth(node);
				let h = this.getNodeHeight(node);
				let x = pos.getX() - w / 2;
				let y = pos.getY() - h / 2;
				this.nodeBounds?.set(node, new Rectangle({ x, y, width: w, height: h }));
			})
		}
		return this.nodeBounds;
	}


	/**
	 * Creates a TreeLayout for a given tree.
	 * In addition to the tree the {@link NodeExtentProvider} and the
	 * {@link Configuration} must be given.
	 * 
	 * @param tree &nbsp;
	 * @param nodeExtentProvider &nbsp;
	 * @param configuration &nbsp;
	 * @param useIdentity
	 *            [default: false] when true, identity ("==") is used instead of
	 *            equality ("equals(...)") when checking nodes. Within a tree
	 *            each node must only exist once (using this check).
	 */

	private addUniqueNodes(nodes: Map<TreeNode, TreeNode>, newNode: TreeNode): void {
		let isKeyOccupied = nodes.has(newNode);
		if (isKeyOccupied) {
			throw new EvalError("Node used more than once in tree: " + newNode);
		}
		nodes.set(newNode, newNode);

		this.tree.getChildren(newNode).forEach((child: TreeNode) => {
			this.addUniqueNodes(nodes, child);
		}, this)
	}

	/**
	 * Check if the tree is a "valid" tree.
	 * Typically you will use this method during development when you get an
	 * unexpected layout from your trees.
	 * The following checks are performed:
	 * Each node must only occur once in the tree
	 */
	checkTree(): void {
		let nodes: Map<TreeNode, TreeNode> =  // todo this.useIdentity ? new IdentityHashMap<TreeNode, TreeNode>() :
			new Map<TreeNode, TreeNode>();

		// Traverse the tree and check if each node is only used once.
		this.addUniqueNodes(nodes, this.tree.getRoot());
	}


	//#region Dump

	private dumpTree(output: any, node: TreeNode, indent: number, dumpConfiguration: DumpConfiguration): void {
		let sb: string = "";
		for (let i = 0; i < indent; i++) {
			sb.concat(dumpConfiguration.indent);
		}

		if (dumpConfiguration.includeObjectToString) {
			sb.concat("[");
			sb.concat((node as any).getName?.() + "@"
				+ Buffer.from((node as any).hashCode?.()).toString('hex'));
			sb.concat("]");
		}
	
		sb.concat(StringUtil.quote(node != null ? (node as any).toString?.() : null));
	
		if (dumpConfiguration.includeNodeSize) {
			sb.concat(" (size: ");
			sb.concat(this.getNodeWidth(node).toString());
			sb.concat("x");
			sb.concat(this.getNodeHeight(node).toString());
			sb.concat(")");
		}
	
		output.println(sb.toString());
		
		this.tree.getChildren(node).forEach((child: TreeNode) => {
			this.dumpTree(output, child, indent + 1, dumpConfiguration);
			
		}, this)
	}
	//#endregion
}

	



