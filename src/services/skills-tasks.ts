import pb from '@/lib/pocketbase/client'

export interface SkillTask {
  id: string
  skill: string
  task_key: string
  title: string
  assigned_to: string | null
  status: 'pending' | 'in_progress' | 'completed'
  completed_at: string | null
  created: string
  updated: string
}

export async function getTasksBySkill(skillId: string): Promise<SkillTask[]> {
  return (await pb.collection('skills_tasks').getFullList({
    filter: `skill = "${skillId}"`,
    sort: 'task_key',
  })) as unknown as SkillTask[]
}

export async function getAllTasks(): Promise<SkillTask[]> {
  return (await pb
    .collection('skills_tasks')
    .getFullList({ sort: '-updated' })) as unknown as SkillTask[]
}

export async function createTask(data: {
  skill: string
  task_key: string
  title: string
  status?: string
}): Promise<SkillTask> {
  return (await pb.collection('skills_tasks').create({
    ...data,
    status: data.status || 'pending',
  })) as unknown as SkillTask
}

export async function updateTask(
  id: string,
  data: Partial<{ status: string; completed_at: string }>,
): Promise<SkillTask> {
  return (await pb.collection('skills_tasks').update(id, data)) as unknown as SkillTask
}

export async function deleteTask(id: string): Promise<void> {
  await pb.collection('skills_tasks').delete(id)
}

export async function upsertTask(
  skillId: string,
  taskKey: string,
  title: string,
  status: string,
): Promise<SkillTask> {
  try {
    const existing = await pb
      .collection('skills_tasks')
      .getFirstListItem(`skill = "${skillId}" && task_key = "${taskKey}"`)
    const updateData: Partial<{ status: string; completed_at: string }> = { status }
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    } else {
      updateData.completed_at = ''
    }
    return (await pb
      .collection('skills_tasks')
      .update(existing.id, updateData)) as unknown as SkillTask
  } catch {
    const createData: Record<string, unknown> = {
      skill: skillId,
      task_key: taskKey,
      title,
      status,
    }
    if (status === 'completed') {
      createData.completed_at = new Date().toISOString()
    }
    return (await pb.collection('skills_tasks').create(createData)) as unknown as SkillTask
  }
}
