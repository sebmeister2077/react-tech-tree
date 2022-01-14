import React, { ReactElement } from "react";
import { ILink, INode } from "../interfaces";
import clsx from "clsx";
import { useStyles } from "./styles";

interface Props {
  id?: string;
  nodes: INode[];
  links: ILink[];
  unlockOnClick?: boolean;
  onChange?: (newLinks: ILink[]) => void;
  onNodeClick?: (id: string) => void;
  onNodeHover?: (id: string) => void;
  onNodeBlur?: (id: string) => void;
  className?: string;
}

export const Tree = (props: Props): JSX.Element => {
  const classes = useStyles();
  return <div className={clsx(classes.treeRoot, props.className)}></div>;
};
