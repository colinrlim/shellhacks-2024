export interface Relationship {
  child_topic: string; // Now storing the actual key as a string
  strength: number;
}

export interface Topic {
  name: string;
  description: string;
  relationships: Relationship[];
  createdBy: string;
}
