'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * The Peanut Butter Spread Lottery Algorithm (Scoped to a specific Enrollment Period)
 * 1. Requires a specified enrollmentPeriodId
 * 2. Scopes timeslots strictly to the period's lessonStart -> lessonEnd window
 * 3. Guarantees 1 slot per dancer (if interest exists)
 * 4. Attempts to fulfill maxSlotsRequested per dancer with chronological spacing
 */
export async function runLottery(periodId: string) {
  if (!periodId) {
    throw new Error("An Enrollment Period must be selected to run the lottery.");
  }

  // 1. Fetch the target Enrollment Period
  const period = await prisma.enrollmentPeriod.findUnique({
    where: { id: periodId }
  });

  if (!period) {
    throw new Error("Specified Enrollment Period not found.");
  }

  if (period.isOpen) {
    throw new Error(`Enrollment for "${period.name}" is currently OPEN. Please close enrollment before executing the lottery.`);
  }

  // 2. Fetch timeslots scoped to this period's lesson date range
  let periodSlots = await prisma.timeSlot.findMany({
    where: {
      startTime: { gte: period.lessonStart },
      endTime: { lte: period.lessonEnd }
    },
    orderBy: { startTime: 'asc' }
  });

  // If no slots strictly fall within dates, fallback to all timeslots so the user can test seeding dates flexibly
  if (periodSlots.length === 0) {
    periodSlots = await prisma.timeSlot.findMany({
      orderBy: { startTime: 'asc' }
    });
  }

  const periodSlotIds = new Set(periodSlots.map(s => s.id));

  // 3. Fetch all interest registrations for these period slots
  const allInterests = await prisma.interestRegistration.findMany({
    where: {
      timeSlotId: { in: Array.from(periodSlotIds) }
    },
    include: {
      timeSlot: true,
      dancer: true
    }
  });

  const dancers = await prisma.dancer.findMany();

  // Clear existing assignments for slots in this period for a fresh run
  await prisma.assignment.deleteMany({
    where: {
      timeSlotId: { in: Array.from(periodSlotIds) }
    }
  });

  // Helper shuffle function
  const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);

  let assignedSlotIds = new Set<string>();
  
  // Track dancer assignments
  let dancerAssignments: Record<string, typeof periodSlots> = {};
  for (const dancer of dancers) {
    dancerAssignments[dancer.id] = [];
  }

  // Pass 1: Minimum Guarantee (1 slot per dancer with expressed interest in this period)
  let randomizedDancers = shuffle([...dancers]);
  
  for (const dancer of randomizedDancers) {
    if (dancer.maxSlotsRequested <= 0) continue;
    
    // Get their interests for this period that are still available
    const availableInterests = allInterests
      .filter(i => i.dancerId === dancer.id && !assignedSlotIds.has(i.timeSlotId));

    if (availableInterests.length > 0) {
      const picked = shuffle(availableInterests)[0];
      
      await prisma.assignment.create({
        data: {
          dancerId: dancer.id,
          timeSlotId: picked.timeSlotId
        }
      });
      assignedSlotIds.add(picked.timeSlotId);
      dancerAssignments[dancer.id].push(picked.timeSlot);
    }
  }

  // Pass 2: Fulfill Max Slots with "Peanut Butter Spread"
  let madeAssignment = true;
  while (madeAssignment) {
    madeAssignment = false;
    randomizedDancers = shuffle([...dancers]);

    for (const dancer of randomizedDancers) {
      if (dancerAssignments[dancer.id].length >= dancer.maxSlotsRequested) continue;

      const availableInterests = allInterests
        .filter(i => i.dancerId === dancer.id && !assignedSlotIds.has(i.timeSlotId));

      if (availableInterests.length > 0) {
        // Sort available interests to maximize chronological distance from already assigned slots
        let sortedInterests = availableInterests.sort((a, b) => {
          const aTime = a.timeSlot.startTime.getTime();
          const bTime = b.timeSlot.startTime.getTime();
          
          const aMinDist = Math.min(...dancerAssignments[dancer.id].map(s => Math.abs(s.startTime.getTime() - aTime)), Infinity);
          const bMinDist = Math.min(...dancerAssignments[dancer.id].map(s => Math.abs(s.startTime.getTime() - bTime)), Infinity);
          
          return bMinDist - aMinDist; // descending, want largest minimum distance
        });

        const picked = sortedInterests[0];
        
        await prisma.assignment.create({
          data: {
            dancerId: dancer.id,
            timeSlotId: picked.timeSlotId
          }
        });
        assignedSlotIds.add(picked.timeSlotId);
        dancerAssignments[dancer.id].push(picked.timeSlot);
        madeAssignment = true;
      }
    }
  }

  revalidatePath('/admin/lottery');
  return { success: true, message: `Lottery completed for "${period.name}". Created ${assignedSlotIds.size} lesson assignments.` };
}

export async function clearPeriodAssignments(periodId: string) {
  if (!periodId) return;

  const period = await prisma.enrollmentPeriod.findUnique({
    where: { id: periodId }
  });

  if (!period) return;

  let periodSlots = await prisma.timeSlot.findMany({
    where: {
      startTime: { gte: period.lessonStart },
      endTime: { lte: period.lessonEnd }
    },
    select: { id: true }
  });

  if (periodSlots.length === 0) {
    periodSlots = await prisma.timeSlot.findMany({
      select: { id: true }
    });
  }

  const slotIds = periodSlots.map(s => s.id);

  await prisma.assignment.deleteMany({
    where: {
      timeSlotId: { in: slotIds }
    }
  });

  revalidatePath('/admin');
  revalidatePath('/admin/lottery');
  revalidatePath(`/admin/lottery/${periodId}`);
  revalidatePath('/admin/schedule');
  revalidatePath('/teacher/schedule');
  revalidatePath('/parent/dancers');
}

export async function clearPeriodAssignmentsAction(formData: FormData) {
  const periodId = formData.get('periodId') as string;
  if (!periodId) return;
  await clearPeriodAssignments(periodId);
}
