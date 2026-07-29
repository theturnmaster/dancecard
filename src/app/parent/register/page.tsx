import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAvailableSlots, getMyDancers, registerInterest, removeInterest } from "@/actions/parent";
import { getEnrollmentPeriods } from "@/actions/admin";
import ParentRegisterClient from "./ParentRegisterClient";

export const dynamic = 'force-dynamic';

export default async function RegisterInterestPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'PARENT') {
    return <div>Unauthorized</div>;
  }

  const [slots, dancers, periods] = await Promise.all([
    getAvailableSlots(),
    getMyDancers(session.user.id),
    getEnrollmentPeriods()
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-500 mb-2">
          Register Interest
        </h1>
        <p className="text-zinc-400 text-lg font-medium">
          Select preferred timeslots on the interactive calendar for your dancers.
        </p>
      </div>

      <ParentRegisterClient 
        periods={periods}
        slots={slots}
        dancers={dancers}
        registerInterestAction={registerInterest}
        removeInterestAction={removeInterest}
      />
    </div>
  );
}
