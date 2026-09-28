export type Sermon = {
  sunday: string; // YYYY-MM-DD
  teacher: string;
  series: string;
  topic: string;
};

export type Sermons = Record<string, Sermon>;
