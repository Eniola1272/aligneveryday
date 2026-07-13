export type CourseStatus = "backlog" | "in_progress" | "completed";
export type LearningPlatform = "YouTube" | "Udemy" | "Coursera" | "Custom";

export type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  portfolio_public: boolean;
};

export type Course = {
  id: string;
  user_id: string;
  title: string;
  platform: LearningPlatform;
  source_url: string | null;
  total_duration_sec: number;
  current_progress_sec: number;
  status: CourseStatus;
};

export type Todo = {
  id: string;
  user_id: string;
  course_id: string | null;
  task_title: string;
  is_completed: boolean;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
};

export type PortfolioInvitationStatus = "pending" | "accepted" | "declined";

export type PortfolioInvitation = {
  id: string;
  inviter_id: string;
  invitee_id: string | null;
  invitee_email: string | null;
  status: PortfolioInvitationStatus;
  message: string | null;
  created_at: string;
  accepted_at: string | null;
  declined_at: string | null;
};

type Insertable<T extends { id: string }> = Omit<T, "id"> & { id?: string };
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
            foreignKeyName: "courses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      todos: {
        Row: Todo;
        Insert: Insertable<Todo>;
        Update: Updatable<Todo>;
        Relationships: [
          {
            foreignKeyName: "todos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "todos_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      portfolio_invitations: {
        Row: PortfolioInvitation;
        Insert: Insertable<PortfolioInvitation>;
        Update: Updatable<PortfolioInvitation>;
        Relationships: [
          {
            foreignKeyName: "portfolio_invitations_inviter_id_fkey";
            columns: ["inviter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "portfolio_invitations_invitee_id_fkey";
            columns: ["invitee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      course_status: CourseStatus;
      portfolio_invitation_status: PortfolioInvitationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
