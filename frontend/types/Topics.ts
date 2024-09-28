export interface Relationship {
  child_topic: string; // Now storing the actual key as a string
  strength: number;
}

export interface Topic {
  description: string;
  relationships: Relationship[];
}
