import { Vector } from "./Vector";

export interface Node {
  label: string;
  children: string[];
  prereqs: string[];
  level?: number;
  position?: Vector;
  velocity?: Vector;
  initialPosition?: Vector;
}

export interface Edge {
  from: string;
  to: string;
}
