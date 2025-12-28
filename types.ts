
export interface Resource {
  label: string;
  vid?: string;
  pdf?: string;
}

export interface Chapter {
  name: string;
  resources: Resource[];
}

export interface AcademyData {
  [subjectKey: string]: Chapter[];
}

export interface UserAccount {
  u: string;
  p: string;
}

export interface AccessControl {
  admins: { [key: string]: UserAccount };
  students: { [key: string]: UserAccount };
}

export interface DeveloperInfo {
  photoURL?: string;
  name?: string;
  subtitle?: string;
}

export type SubjectKey = 'p1' | 'p2' | 'c1' | 'c2' | 'b1' | 'b2' | 'm1' | 'm2' | 'ict' | 'lan' | 'archive';

export const SUBJECT_NAMES: Record<SubjectKey, string> = {
  p1: "Physics 1st",
  p2: "Physics 2nd",
  c1: "Chemistry 1st",
  c2: "Chemistry 2nd",
  b1: "Biology 1st",
  b2: "Biology 2nd",
  m1: "Higher Math 1st",
  m2: "Higher Math 2nd",
  ict: "ICT",
  lan: "Languages",
  archive: "Resource Archive"
};
