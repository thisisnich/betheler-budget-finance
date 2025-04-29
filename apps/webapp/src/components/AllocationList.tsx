import { AllocationCard } from '@/components/AllocationCard';

type AllocationType = 'amount' | 'percentage' | 'overflow';

interface Allocation {
  _id: string;
  category: string;
  type: AllocationType;
  value: number;
  priority: number;
}

interface AllocationListProps {
  allocations: Allocation[];
  onChange: (allocationId: string, key: keyof Allocation, value: string | number) => Promise<void>;
  onDelete: (allocationId: string) => Promise<void>;
}

export function AllocationList({ allocations, onChange, onDelete }: AllocationListProps) {
  return (
    <div className="space-y-6">
      {allocations.length === 0 ? (
        <p className="text-center text-gray-500">
          No allocations found. Add some categories to get started.
        </p>
      ) : (
        allocations.map((allocation) => (
          <AllocationCard
            key={allocation._id}
            allocation={allocation}
            onChange={(key, value) => onChange(allocation._id, key, value)}
            onDelete={() => onDelete(allocation._id)}
          />
        ))
      )}
    </div>
  );
}
