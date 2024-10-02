// @/types/Topics

// Relationship interface
export interface Relationship {
  child_topic: string; // Now storing the actual key as a string
  strength: number;
}

// Topic interface
export interface Topic {
  name: string;
  description: string;
  relationships: Relationship[];
  createdBy: string;
}
