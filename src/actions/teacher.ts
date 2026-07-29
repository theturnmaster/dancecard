'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function getTeacherSlots(teacherId: string) {
  return await prisma.timeSlot.findMany({
    where: { teacherId },
    include: {
      room: true,
      interestRegistrations: {
        include: { dancer: true }
      },
      assignment: {
        include: { dancer: true }
      }
    },
    orderBy: { startTime: 'asc' }
  });
}

export async function createTeacherSlot(teacherId: string, roomId: string, startTime: Date, endTime: Date) {
  await prisma.timeSlot.create({
    data: {
      teacherId,
      roomId,
      startTime,
      endTime
    }
  });
  revalidatePath('/teacher/schedule');
}

export async function deleteTeacherSlot(slotId: string, teacherId: string) {
  // Ensure the slot belongs to the teacher before deleting
  await prisma.timeSlot.deleteMany({
    where: {
      id: slotId,
      teacherId
    }
  });
  revalidatePath('/teacher/schedule');
}
