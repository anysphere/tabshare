export type InternalTab = {
  tabId: number;
  id: string;
  url: string;
};

export type Tab = {
  id: string;
  url: string;
  creator: string;
  timestamp: number;
};

export type Action = {
  type: "ADD" | "UPDATE" | "REMOVE" | "MOVE";
  index: number; // Only for ADD and MOVE
  url: string; // Only for ADD and UPDATE
  id: string;
  by: string;
  actionId: string;
};
