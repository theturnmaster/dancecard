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
  // Overlap check
  const existingOverlap = await prisma.timeSlot.findFirst({
    where: {
      roomId,
      startTime: { lt: endTime },
      endTime: { gt: startTime }
    }
  });

  if (existingOverlap) {
    throw new Error("Overlapping slot: This room is already scheduled for that time block.");
  }

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

export async function deleteTeacherSlot(teacherId: string, slotId: string) {
  // Ensure the slot belongs to the teacher before deleting
  await prisma.timeSlot.deleteMany({
    where: {
      id: slotId,
      teacherId
    }
  });
  revalidatePath('/teacher/schedule');
}

export async function updateTeacherSlot(teacherId: string, slotId: string, startTime: Date, endTime: Date) {
  const slot = await prisma.timeSlot.findUnique({ where: { id: slotId }});
  if (slot?.teacherId === teacherId) {
    await prisma.timeSlot.update({
      where: { id: slotId },
      data: { startTime, endTime }
    });
    revalidatePath('/teacher/schedule');
  }
}
