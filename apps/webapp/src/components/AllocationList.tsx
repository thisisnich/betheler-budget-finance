import type { Allocation, AllocationType } from '@/types/schema';
import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { AllocationCard } from './AllocationCard';
// interface AllocationListProps {
//   allocations: Allocation[]; // List of allocations passed as a prop
// }

interface AllocationCardProps {
  allocation: Allocation; // Individual allocation
  allocations?: Allocation[]; // Optional full list of allocations
}
export function AllocationList() {
  const rawAllocations = useSessionQuery(api.allocation.getAllocations) || []; // Fetch raw data
  const allocations: Allocation[] = rawAllocations.map((allocation) => ({
    ...allocation,
    type: allocation.type as AllocationType, // Cast type to AllocationType
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {allocations.length === 0 ? (
        <p className="text-center text-gray-500 col-span-full">
          No allocations found. Add some categories to get started.
        </p>
      ) : (
        allocations.map((allocation) => (
          <AllocationCard
            key={allocation._id}
            allocation={allocation} // Pass only the individual allocation
          />
        ))
      )}
    </div>
  );
}
