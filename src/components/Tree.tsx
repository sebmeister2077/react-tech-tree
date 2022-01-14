import React, { ReactElement } from "react";
import { ILink, INode } from "../interfaces";
import clsx from "clsx";

interface Props {
  id?: string;
  nodes: INode[] | ReactElement[];
  links: ILink[];
  onNodeClick?: (id: string) => void;
  onNodeHover?: (id: string) => void;
  onNodeBlur?: (id: string) => void;
  className?: string;
}

export const Tree = (props: Props): JSX.Element => {
  return <div className={clsx()}></div>;
};
