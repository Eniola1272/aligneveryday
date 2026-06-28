import { useEffect, useState } from 'react';

import { getMockWorkspace } from '@/data/mock';
import { supabase } from '@/lib/supabase';
import type { CourseWorkspace } from '@/types/learning';

interface CourseWorkspaceData {
  workspace: CourseWorkspace;
  isLoading: boolean;
  isMockData: boolean;
}

export function useCourseWorkspace(
  courseId?: string,
  userId?: string,
): CourseWorkspaceData {
  const [data, setData] = useState<CourseWorkspaceData>({
    workspace: getMockWorkspace(courseId),
    isLoading: Boolean(courseId && userId && supabase),
    isMockData: true,
  });

  useEffect(() => {
    const mockWorkspace = getMockWorkspace(courseId);
    setData({
      workspace: mockWorkspace,
      isLoading: Boolean(courseId && userId && supabase),
      isMockData: true,
    });

    if (!courseId || !userId || !supabase) return;

    let isMounted = true;

    async function hydrateCourse() {
      const result = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .eq('user_id', userId)
        .single();

      if (!isMounted) return;
      if (result.error) {
        setData((current) => ({ ...current, isLoading: false }));
        return;
      }

      setData({
        workspace: { ...result.data, milestones: mockWorkspace.milestones },
        isLoading: false,
        isMockData: false,
      });
    }

    void hydrateCourse();

    return () => {
      isMounted = false;
    };
  }, [courseId, userId]);

  return data;
}
