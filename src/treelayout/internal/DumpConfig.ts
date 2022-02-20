export class DumpConfiguration {
    /**
     * The text used to indent the output per level.
     */
    readonly indent: string;
    /**
     * When true the dump also includes the size of each node, otherwise
     * not.
     */
    readonly includeNodeSize: boolean;
    /**
     * When true, the text as returned by {@link Object#toString()}, is
     * included in the dump, in addition to the text returned by the
     * possibly overridden toString method of the node. When the hashCode
     * method is overridden the output will also include the
     * "identityHashCode".
     */
    readonly includeObjectToString: boolean;

    /**
     * 
     * @param indent [default: "    "]
     * @param includeNodeSize [default: false]
     * @param includePointer [default: false]
     */
    constructor(indent: string = "  ", includeNodeSize: boolean,
        includePointer: boolean) {
        this.indent = indent;
        this.includeNodeSize = includeNodeSize;
        this.includeObjectToString = includePointer;
    }
}