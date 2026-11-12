export type PostCategory = "OSI" | "Routing" | "Wireless" | "Fiber" | "5G" | "Security";

export const POST_CATEGORIES: PostCategory[] = [
  "OSI",
  "Routing",
  "Wireless",
  "Fiber",
  "5G",
  "Security",
];

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: PostCategory;
  cover_url: string | null;
  published: boolean;
  created_at: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  topic: string;
  difficulty: 1 | 2 | 3;
  created_at: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  mode: "subnetting" | "theory" | "mixed";
  score: number;
  total: number;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string;
  role: "user" | "admin";
  created_at: string;
}

/** Row shapes used by the admin results table (quiz_results joined with profiles). */
export interface QuizResultWithUser extends QuizResult {
  display_name: string | null;
  email: string | null;
}
