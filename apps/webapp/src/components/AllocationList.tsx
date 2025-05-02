import { AllocationCard } from './AllocationCard';

interface Allocation {
  _id: string;
  category: string;
  type: 'amount' | 'percentage' | 'overflow';
  value: number;
  priority: number;
}

interface AllocationListProps {
  allocations: Allocation[]; // List of allocations passed as a prop
}

export function AllocationList({ allocations = [] }: AllocationListProps) {
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
            allocation={allocation} // Pass the individual allocation
            allocations={allocations} // Pass the full list of allocations
          />
        ))
      )}
    </div>
  );
}
