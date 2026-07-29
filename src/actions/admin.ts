'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function createUserAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as any;

  if (!name || !email || !password || !role) return;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return; // Silent fail for now, ideally return an error state

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
      role
    }
  });
  
  revalidatePath('/admin/users');
}

export async function updateUserRole(userId: string, role: any) {
  await prisma.user.update({
    where: { id: userId },
    data: { role }
  });
  revalidatePath('/admin/users');
}

export async function handleRoleChangeAction(formData: FormData) {
  const userId = formData.get('userId') as string;
  const role = formData.get('role') as any;
  await updateUserRole(userId, role);
}

export async function deleteUser(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath('/admin/users');
}

export async function handleDeleteAction(formData: FormData) {
  const userId = formData.get('userId') as string;
  await deleteUser(userId);
}

export async function getRooms() {
  return await prisma.room.findMany();
}

export async function createRoom(name: string) {
  await prisma.room.create({ data: { name } });
  revalidatePath('/admin/schedule');
}

export async function createTimeSlot(roomId: string, teacherId: string, startTime: Date, endTime: Date) {
  await prisma.timeSlot.create({
    data: {
      roomId,
      teacherId,
      startTime,
      endTime
    }
  });
  revalidatePath('/admin/schedule');
}

export async function updateTimeSlot(slotId: string, startTime: Date, endTime: Date) {
  await prisma.timeSlot.update({
    where: { id: slotId },
    data: { startTime, endTime }
  });
  revalidatePath('/admin/schedule');
}

export async function deleteTimeSlot(slotId: string) {
  await prisma.timeSlot.delete({ where: { id: slotId }});
  revalidatePath('/admin/schedule');
}

export async function getEnrollmentStatus() {
  const period = await prisma.enrollmentPeriod.findFirst({
    orderBy: { startTime: 'desc' }
  });
  return period;
}

export async function toggleEnrollment(isOpen: boolean) {
  let period = await prisma.enrollmentPeriod.findFirst({
    orderBy: { startTime: 'desc' }
  });
  
  if (!period) {
    period = await prisma.enrollmentPeriod.create({
      data: {
        startTime: new Date(),
        endTime: new Date(new Date().setMonth(new Date().getMonth() + 2)),
        isOpen
      }
    });
  } else {
    await prisma.enrollmentPeriod.update({
      where: { id: period.id },
      data: { isOpen }
    });
  }
  revalidatePath('/admin');
  revalidatePath('/admin/lottery');
}
