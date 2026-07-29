'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getMyDancers(parentId: string) {
  return await prisma.dancer.findMany({
    where: { parentId },
    include: {
      interestRegistrations: {
        include: { timeSlot: { include: { room: true, teacher: true } } }
      },
      assignments: {
        include: { timeSlot: { include: { room: true, teacher: true } } }
      }
    }
  });
}

export async function createDancer(parentId: string, name: string, age: number, maxSlots: number) {
  await prisma.dancer.create({
    data: {
      parentId,
      name,
      age,
      maxSlotsRequested: maxSlots
    }
  });
  revalidatePath('/parent/dancers');
}

export async function deleteDancer(dancerId: string) {
  await prisma.dancer.delete({ where: { id: dancerId } });
  revalidatePath('/parent/dancers');
}

export async function registerInterest(dancerId: string, timeSlotId: string) {
  try {
    await prisma.interestRegistration.create({
      data: {
        dancerId,
        timeSlotId
      }
    });
    revalidatePath('/parent/register');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Already registered or error occurred' };
  }
}

export async function removeInterest(dancerId: string, timeSlotId: string) {
  await prisma.interestRegistration.deleteMany({
    where: {
      dancerId,
      timeSlotId
    }
  });
  revalidatePath('/parent/register');
  revalidatePath('/parent/dancers');
}

export async function getAvailableSlots() {
  return await prisma.timeSlot.findMany({
    include: { 
      room: true, 
      teacher: true,
      assignment: {
        include: { dancer: true }
      }
    },
    orderBy: { startTime: 'asc' }
  });
}
