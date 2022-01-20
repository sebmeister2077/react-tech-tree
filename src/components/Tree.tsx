import React, { ReactElement, useMemo, useRef } from "react";
import { ILayer, ILink, INode, INodeComputed, TreeType } from "../types";
import clsx from "clsx";
import { useStyles } from "./styles";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import DefaultNode from "./DefaultNode";
import { createLayers, getLayerWithMaxNodes } from "../helpers/NodeHelper";
import { createPropsStyles } from "../helpers/StyleHelper";

interface Props {
  id?: string;
  nodes: INode[];
  links: ILink[];
  type?: TreeType;
  showLinks?: boolean;
  className?: string;
  style?: CSSProperties;
  // allowMoreParents?: boolean;
}

/** Deosnt support 2+ roots combining into 1 child */
export const Tree = (props: Props): JSX.Element => {
  const propStyles = createPropsStyles(props.type);
  const classes = useStyles(propStyles);
  const layers = useMemo(
    () => createLayers(props.nodes, props.links),
    [props.nodes, props.links]
  );
  const layerWithMaxNodes = useMemo(
    () => getLayerWithMaxNodes(layers),
    [layers]
  );
  const flexPercentageUnit = 100 / layerWithMaxNodes.nodes.length;
  console.log(layers);

  return (
    <div
      className={clsx(classes.treeRoot, props.className)}
      style={props.style}
    >
      {layers.map((layer: ILayer, idx: number) => (
        <div className={classes.layer} key={layer.level}>
          {layer.nodes.map((node: INodeComputed) => {
            let element = <DefaultNode node={node} key={node.id} />;
            if (node.component) {
              element = node.component;
            }

            const flexBasisStyle = `${node.children * flexPercentageUnit}%`;
            return (
              <div
                style={{ flexBasis: flexBasisStyle }}
                key={node.id}
                className={classes.elementContainer}
              >
                {element}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
