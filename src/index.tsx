import { Button } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom";
import { Tree } from "./components/Tree";
import { ILink, INode } from "./types";


/** Demo */
const nodes: INode[] = [
  { id: "A0", text: "A, Parent of b,d,e,f", isRoot: true, component:<Button>Click me, im 'A', parent of b,d,e,f</Button>  },
  { id: "B0", text: "B, parent of g,h" },
  { id: "C0", text: "C, parent of i", isRoot: true },
  { id: "D0", text: "Hello its D" },
  { id: "E0", text: "E, parent of O,J" },
  { id: "F0", text: "F, parent of M,K" },
  { id: "G0", text: "Hello its G" },
  { id: "H0", text: "Hello its H" },
  { id: "I", text: "Hello its I" },
  { id: "J", text: "Hello its J" },
  { id: "K", text: "K, parent of N" },
  { id: "L", text: "Hello its L" },
  { id: "M", text: "Hello its M" },
  { id: "N", text: "N, parent of L" },
  { id: "O", text: "Hello its O" },
];
const links: ILink[] = [
  { id: "1", nodeA: "A0", nodeB: "B0" },
  { id: "2", nodeA: "A0", nodeB: "D0" },
  { id: "4", nodeA: "A0", nodeB: "E0" },
  { id: "5", nodeA: "A0", nodeB: "F0" },
  { id: "6", nodeA: "B0", nodeB: "G0" },
  { id: "6", nodeA: "B0", nodeB: "H0" },
  { id: "7", nodeA: "K", nodeB: "N" },
  { id: "8", nodeA: "C0", nodeB: "I" },
  { id: "9", nodeA: "I", nodeB: "J" },
  { id: "10", nodeA: "F0", nodeB: "K" },
  { id: "11", nodeA: "F0", nodeB: "M" },
  { id: "12", nodeA: "I", nodeB: "O" },
  { id: "13", nodeA: "N", nodeB: "L" },
];


ReactDOM.render(
  <React.Fragment>
    <Tree nodes={nodes} links={links} />
  </React.Fragment>,
  document.getElementById("root")
);
