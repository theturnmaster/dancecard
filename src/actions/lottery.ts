'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

/**
 * The Peanut Butter Spread Lottery Algorithm
 * 1. Guarantees 1 slot per dancer (if interest exists)
 * 2. Attempts to fulfill maxSlotsRequested per dancer
 * 3. Spaces out slots chronologically
 */
export async function runLottery() {
  // 1. Fetch all interests, group by dancer
  const allInterests = await prisma.interestRegistration.findMany({
    include: {
      timeSlot: true,
      dancer: true
    }
  });

  const dancers = await prisma.dancer.findMany();
  
  // Clear previous assignments for a fresh lottery run
  await prisma.assignment.deleteMany({});

  // Shuffle function
  const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);

  let unassignedSlots = await prisma.timeSlot.findMany({
    orderBy: { startTime: 'asc' }
  });
  let assignedSlotIds = new Set<string>();
  
  // Track dancer assignments
  let dancerAssignments: Record<string, typeof unassignedSlots> = {};
  for (const dancer of dancers) {
    dancerAssignments[dancer.id] = [];
  }

  // Pass 1: Minimum Guarantee (1 slot per dancer)
  let randomizedDancers = shuffle([...dancers]);
  
  for (const dancer of randomizedDancers) {
    if (dancer.maxSlotsRequested <= 0) continue;
    
    // Get their interests that are still available
    const availableInterests = allInterests
      .filter(i => i.dancerId === dancer.id && !assignedSlotIds.has(i.timeSlotId));

    if (availableInterests.length > 0) {
      // Pick random one for the first pass
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
        // For simplicity in this implementation, we sort by absolute distance to the closest already assigned slot (descending)
        let sortedInterests = availableInterests.sort((a, b) => {
          const aTime = a.timeSlot.startTime.getTime();
          const bTime = b.timeSlot.startTime.getTime();
          
          const aMinDist = Math.min(...dancerAssignments[dancer.id].map(s => Math.abs(s.startTime.getTime() - aTime)), Infinity);
          const bMinDist = Math.min(...dancerAssignments[dancer.id].map(s => Math.abs(s.startTime.getTime() - bTime)), Infinity);
          
          return bMinDist - aMinDist; // descending, want largest minimum distance
        });

        // Pick the one furthest away
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
  return { success: true, message: 'Lottery completed successfully' };
}
