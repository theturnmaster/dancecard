'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from "bcrypt";

// Helper to parse "YYYY-MM-DD" as a local Date object without UTC timezone shifting
function parseLocalDate(dateStr: string, isEnd = false): Date {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return new Date(dateStr);
  if (isEnd) {
    return new Date(year, month - 1, day, 23, 59, 59, 999);
  }
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function getTeachers() {
  return await prisma.user.findMany({
    where: { role: 'TEACHER' },
    orderBy: { name: 'asc' }
  });
}

export async function createUserAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as any;

  if (!name || !email || !password || !role) return;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return;

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
  revalidatePath('/admin/studio');
  revalidatePath('/admin/schedule');
}

export async function deleteRoom(roomId: string) {
  await prisma.room.delete({ where: { id: roomId } });
  revalidatePath('/admin/studio');
  revalidatePath('/admin/schedule');
}

export async function createTimeSlot(roomId: string, teacherId: string, startTime: Date, endTime: Date) {
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
    where: { isOpen: true },
    orderBy: { enrollmentStart: 'desc' }
  });
  return period;
}

export async function getEnrollmentPeriods() {
  return await prisma.enrollmentPeriod.findMany({
    orderBy: { enrollmentStart: 'desc' }
  });
}

export async function createEnrollmentPeriodAction(formData: FormData) {
  const name = formData.get('name') as string;
  const enrollmentStartStr = formData.get('enrollmentStart') as string;
  const enrollmentEndStr = formData.get('enrollmentEnd') as string;
  const lessonStartStr = formData.get('lessonStart') as string;
  const lessonEndStr = formData.get('lessonEnd') as string;
  const isOpen = formData.get('isOpen') === 'true';

  if (!name || !enrollmentStartStr || !enrollmentEndStr) return;

  if (isOpen) {
    await prisma.enrollmentPeriod.updateMany({
      data: { isOpen: false }
    });
  }

  const enrollmentStart = parseLocalDate(enrollmentStartStr);
  const enrollmentEnd = parseLocalDate(enrollmentEndStr, true);
  const lessonStart = parseLocalDate(lessonStartStr || enrollmentStartStr);
  const lessonEnd = parseLocalDate(lessonEndStr || enrollmentEndStr, true);

  await prisma.enrollmentPeriod.create({
    data: {
      name,
      enrollmentStart,
      enrollmentEnd,
      lessonStart,
      lessonEnd,
      isOpen
    }
  });

  revalidatePath('/admin');
  revalidatePath('/admin/lottery');
  revalidatePath('/parent/register');
}

export async function toggleEnrollmentPeriodAction(formData: FormData) {
  const periodId = formData.get('periodId') as string;
  const currentIsOpen = formData.get('currentIsOpen') === 'true';

  if (!periodId) return;

  const targetIsOpen = !currentIsOpen;

  if (targetIsOpen) {
    await prisma.enrollmentPeriod.updateMany({
      data: { isOpen: false }
    });
  }

  await prisma.enrollmentPeriod.update({
    where: { id: periodId },
    data: { isOpen: targetIsOpen }
  });

  revalidatePath('/admin');
  revalidatePath('/admin/lottery');
  revalidatePath('/parent/register');
}

export async function deleteEnrollmentPeriodAction(formData: FormData) {
  const periodId = formData.get('periodId') as string;
  if (!periodId) return;

  await prisma.enrollmentPeriod.delete({
    where: { id: periodId }
  });

  revalidatePath('/admin');
  revalidatePath('/admin/lottery');
  revalidatePath('/parent/register');
}

export async function updateEnrollmentPeriodAction(formData: FormData) {
  const periodId = formData.get('periodId') as string;
  const name = formData.get('name') as string;
  const enrollmentStartStr = formData.get('enrollmentStart') as string;
  const enrollmentEndStr = formData.get('enrollmentEnd') as string;
  const lessonStartStr = formData.get('lessonStart') as string;
  const lessonEndStr = formData.get('lessonEnd') as string;

  if (!periodId || !name || !enrollmentStartStr || !enrollmentEndStr) return;

  const enrollmentStart = parseLocalDate(enrollmentStartStr);
  const enrollmentEnd = parseLocalDate(enrollmentEndStr, true);
  const lessonStart = parseLocalDate(lessonStartStr || enrollmentStartStr);
  const lessonEnd = parseLocalDate(lessonEndStr || enrollmentEndStr, true);

  await prisma.enrollmentPeriod.update({
    where: { id: periodId },
    data: {
      name,
      enrollmentStart,
      enrollmentEnd,
      lessonStart,
      lessonEnd
    }
  });

  revalidatePath('/admin');
  revalidatePath('/admin/lottery');
  revalidatePath('/admin/schedule');
  revalidatePath('/teacher/schedule');
  revalidatePath('/parent/register');
}

export async function approveUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { isApproved: true }
  });
  revalidatePath('/admin');
  revalidatePath('/admin/users');
}

export async function approveUserAction(formData: FormData) {
  const userId = formData.get('userId') as string;
  if (!userId) return;
  await approveUser(userId);
}
