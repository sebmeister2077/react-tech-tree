import { TreeType } from "../types";

export function createPropsStyles(type?: TreeType) {
    switch (type) {
        case TreeType.toBottom:
            return { transform: "0deg" };
        case TreeType.toLeft:
            return { transform: "90deg" };
        case TreeType.toTop:
            return { transform: "180deg" };
        case TreeType.toRight:
            return { transform: "270deg" };
        default:
            return { transform: "0deg" };
  }
}