export type CourseStatus = 'backlog' | 'in_progress' | 'completed';
export type LearningPlatform = 'YouTube' | 'Udemy' | 'Coursera' | 'Custom';

export interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  portfolio_public: boolean;
}

export interface Course {
  id: string;
  user_id: string;
  title: string;
  platform: LearningPlatform;
  source_url: string | null;
  total_duration_sec: number;
  current_progress_sec: number;
  status: CourseStatus;
}

export interface Todo {
  id: string;
  user_id: string;
  course_id: string | null;
  task_title: string;
  is_completed: boolean;
  due_date: string | null;
}

type Insertable<T extends { id: string }> = Omit<T, 'id'> & { id?: string };
type Updatable<T> = Partial<T>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Insertable<Profile>;
        Update: Updatable<Profile>;
        Relationships: [];
      };
      courses: {
        Row: Course;
        Insert: Insertable<Course>;
        Update: Updatable<Course>;
        Relationships: [
          {
            foreignKeyName: 'courses_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      todos: {
        Row: Todo;
        Insert: Insertable<Todo>;
        Update: Updatable<Todo>;
        Relationships: [
          {
            foreignKeyName: 'todos_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'todos_course_id_fkey';
            columns: ['course_id'];
            isOneToOne: false;
            referencedRelation: 'courses';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      course_status: CourseStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
