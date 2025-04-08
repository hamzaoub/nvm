export type Update = {
  id: number;
  title: string;
  description: string;
  date: string;
  type: 'update' | 'announcement' | 'release';
  link?: string;
};

export type Suggestion = {
  id: number;
  title: string;
  description: string;
  author: string;
  date: string;
  votes: number;
  status: 'new' | 'under-review' | 'planned' | 'implemented';
};

export type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
  link?: string;
};
