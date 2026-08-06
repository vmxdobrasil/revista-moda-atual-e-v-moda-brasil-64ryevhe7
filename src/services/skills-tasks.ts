import pb from '@/lib/pocketbase/client'

export interface SkillTask {
  id: string
  skill: string
  task_key: string
  title: string
  assigned_to: string
  status: 'pending' | 'in_progress' | 'completed'
  completed_at: string | null
  created: string
  updated: string
}

export async function getTasksBySkill(skillId: string): Promise<SkillTask[]> {
  return (await pb.collection('skills_tasks').getFullList({
    filter: `skill = "${skillId}"`,
    sort: 'created',
  })) as unknown as SkillTask[]
}

export async function getAllTasks(): Promise<SkillTask[]> {
  return (await pb
    .collection('skills_tasks')
    .getFullList({ sort: '-created' })) as unknown as SkillTask[]
}

export async function upsertTask(data: {
  skill: string
  task_key: string
  title: string
  status: 'pending' | 'in_progress' | 'completed'
}): Promise<SkillTask> {
  let existing: SkillTask | null = null
  try {
    existing = (await pb
      .collection('skills_tasks')
      .getFirstListItem(
        `skill = "${data.skill}" && task_key = "${data.task_key}"`,
      )) as unknown as SkillTask
  } catch {
    existing = null
  }

  const now = new Date().toISOString()

  if (existing) {
    const updateData: Record<string, unknown> = { status: data.status }
    updateData.completed_at = data.status === 'completed' ? now : null
    return (await pb
      .collection('skills_tasks')
      .update(existing.id, updateData)) as unknown as SkillTask
  }

  const createData: Record<string, unknown> = {
    skill: data.skill,
    task_key: data.task_key,
    title: data.title,
    status: data.status,
    assigned_to: pb.authStore.record?.id || '',
  }
  createData.completed_at = data.status === 'completed' ? now : null
  return (await pb.collection('skills_tasks').create(createData)) as unknown as SkillTask
}
