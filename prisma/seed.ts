import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { startOfWeek, addDays, setHours, setMinutes } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with realistic dance studio data...');

  const passwordHash = await bcrypt.hash('password', 10);

  // 1. Clean existing transactional data for a fresh seed
  await prisma.assignment.deleteMany({});
  await prisma.interestRegistration.deleteMany({});
  await prisma.timeSlot.deleteMany({});
  await prisma.dancer.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.enrollmentPeriod.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Admin Account
  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      name: 'Studio Administrator',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // 3. Create 2 Rooms: Studio A & Studio B
  const roomA = await prisma.room.create({ data: { name: 'Studio A' } });
  const roomB = await prisma.room.create({ data: { name: 'Studio B' } });
  const rooms = [roomA, roomB];

  // 4. Create 8 Teachers
  const teacherNames = [
    'Sarah Jenkins',
    'Michael Chang',
    'Emily Rodriguez',
    'David Kim',
    'Jessica Taylor',
    'Robert Martinez',
    'Amanda White',
    'James Wilson',
  ];

  const teachers: any[] = [];
  for (let i = 0; i < teacherNames.length; i++) {
    const email = i === 0 ? 'teacher@test.com' : `teacher${i + 1}@test.com`;
    const teacher = await prisma.user.create({
      data: {
        email,
        name: teacherNames[i],
        passwordHash,
        role: 'TEACHER',
      },
    });
    teachers.push(teacher);
  }

  // 5. Create 20 Parents
  const parentNames = [
    'Laura Smith', 'Daniel Johnson', 'Rachel Brown', 'Chris Davis',
    'Megan Miller', 'Kevin Wilson', 'Hannah Moore', 'Brian Taylor',
    'Ashley Anderson', 'Matthew Thomas', 'Sophia Jackson', 'Andrew White',
    'Olivia Harris', 'Joshua Martin', 'Emma Thompson', 'Ryan Garcia',
    'Grace Martinez', 'Tyler Robinson', 'Chloe Clark', 'Brandon Rodriguez'
  ];

  const parents: any[] = [];
  for (let i = 0; i < parentNames.length; i++) {
    const email = i === 0 ? 'parent@test.com' : `parent${i + 1}@test.com`;
    const parent = await prisma.user.create({
      data: {
        email,
        name: parentNames[i],
        passwordHash,
        role: 'PARENT',
      },
    });
    parents.push(parent);
  }

  // 6. Create 30 Dancers (distributed across the 20 parents)
  const dancerFirstNames = [
    'Lily', 'Ethan', 'Maya', 'Lucas', 'Zoe', 'Caleb', 'Ava', 'Mason',
    'Ella', 'Liam', 'Sofia', 'Noah', 'Mia', 'Oliver', 'Charlotte', 'Elijah',
    'Amelia', 'James', 'Harper', 'Benjamin', 'Evelyn', 'Alexander', 'Abigail', 'Henry',
    'Emily', 'Sebastian', 'Elizabeth', 'Jack', 'Aria', 'Owen'
  ];

  const dancers: any[] = [];
  let dancerIndex = 0;

  // 10 parents get 2 dancers, 10 parents get 1 dancer = 30 dancers total
  for (let p = 0; p < parents.length; p++) {
    const parent = parents[p];
    const numDancersForParent = p < 10 ? 2 : 1;

    for (let d = 0; d < numDancersForParent; d++) {
      const dancerName = `${dancerFirstNames[dancerIndex]} ${parent.name.split(' ')[1]}`;
      const age = Math.floor(Math.random() * 10) + 7; // Ages 7-16
      const maxSlotsRequested = (dancerIndex % 3) + 1; // 1 to 3 slots requested

      const dancer = await prisma.dancer.create({
        data: {
          name: dancerName,
          age,
          maxSlotsRequested,
          parentId: parent.id,
        },
      });
      dancers.push(dancer);
      dancerIndex++;
    }
  }

  // 7. Create Timeslots Monday through Sunday in the afternoons (3 PM - 9 PM)
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const createdSlots: any[] = [];

  // Afternoon time blocks per day (e.g. 15:00-15:45, 16:00-16:45, 17:00-17:45, 18:00-18:45, 19:00-19:45, 20:00-20:45)
  const timeBlocks = [
    { startH: 15, startM: 0, endH: 15, endM: 45 },
    { startH: 16, startM: 0, endH: 16, endM: 45 },
    { startH: 17, startM: 0, endH: 17, endM: 45 },
    { startH: 18, startM: 0, endH: 18, endM: 45 },
    { startH: 19, startM: 0, endH: 19, endM: 45 },
    { startH: 20, startM: 0, endH: 20, endM: 45 },
  ];

  let teacherIdx = 0;

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDay = addDays(monday, dayOffset);

    for (const room of rooms) {
      for (const block of timeBlocks) {
        const startTime = setMinutes(setHours(currentDay, block.startH), block.startM);
        const endTime = setMinutes(setHours(currentDay, block.endH), block.endM);

        const assignedTeacher = teachers[teacherIdx % teachers.length];
        teacherIdx++;

        const timeSlot = await prisma.timeSlot.create({
          data: {
            roomId: room.id,
            teacherId: assignedTeacher.id,
            startTime,
            endTime,
          },
        });
        createdSlots.push(timeSlot);
      }
    }
  }

  // 8. Seed Interest Registrations across Dancers (2 to 5 registrations per dancer)
  let totalInterestsCreated = 0;
  for (const dancer of dancers) {
    // Pick 2-5 random slots for this dancer
    const numInterests = Math.floor(Math.random() * 4) + 2;
    const shuffledSlots = [...createdSlots].sort(() => 0.5 - Math.random());
    const selectedSlots = shuffledSlots.slice(0, numInterests);

    for (const slot of selectedSlots) {
      try {
        await prisma.interestRegistration.create({
          data: {
            dancerId: dancer.id,
            timeSlotId: slot.id,
          },
        });
        totalInterestsCreated++;
      } catch (err) {
        // Ignore duplicate composite constraint if any
      }
    }
  }

  // 9. Initialize Enrollment Periods
  await prisma.enrollmentPeriod.create({
    data: {
      name: 'Fall 2026 Private Lessons',
      enrollmentStart: new Date('2026-07-01T00:00:00Z'),
      enrollmentEnd: new Date('2026-07-31T23:59:59Z'),
      lessonStart: new Date('2026-09-01T00:00:00Z'),
      lessonEnd: new Date('2026-11-30T23:59:59Z'),
      isOpen: false,
    },
  });

  await prisma.enrollmentPeriod.create({
    data: {
      name: 'Spring 2027 Private Lessons',
      enrollmentStart: new Date('2026-11-01T00:00:00Z'),
      enrollmentEnd: new Date('2026-11-15T23:59:59Z'),
      lessonStart: new Date('2027-01-10T00:00:00Z'),
      lessonEnd: new Date('2027-05-25T23:59:59Z'),
      isOpen: false,
    },
  });

  console.log('\n========================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('========================================');
  console.log(`- Admin: admin@test.com (password: 'password')`);
  console.log(`- Teachers (8): teacher@test.com, teacher2@test.com ... teacher8@test.com (password: 'password')`);
  console.log(`- Parents (20): parent@test.com, parent2@test.com ... parent20@test.com (password: 'password')`);
  console.log(`- Dancers (30): Created & mapped across parents`);
  console.log(`- Studio Rooms (2): Studio A, Studio B`);
  console.log(`- Timeslots Created: ${createdSlots.length} (Mon-Sun 3 PM - 9 PM)`);
  console.log(`- Interest Registrations Seeded: ${totalInterestsCreated}`);
  console.log(`- Reservations/Assignments: 0 (Ready for Lottery execution!)`);
  console.log('========================================\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
