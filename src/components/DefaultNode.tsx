import React from "react";
import { INode } from "../types";
import { useStyles } from "./styles";

interface Props {
  node: INode;
}

const DefaultNode = (props: Props) => {
  const classes = useStyles({});

  return <div className={classes.defaultNode}>{props.node.text}</div>;
};

export default DefaultNode;
