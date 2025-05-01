import { CategorySelect } from '@/components/CategorySelect';
import { Button } from '@/components/ui/button';
import type { Allocation } from '@/types/schema';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AllocationTypeSelect } from './AllocationTypeSelect';
interface AddAllocationFormProps {
  onAdd: (allocation: Allocation) => Promise<void>;
  allocations: Allocation[];
  initialAllocation?: Allocation;
}

export function AddAllocationForm({
  onAdd,
  allocations,
  initialAllocation,
}: AddAllocationFormProps) {
  const [newAllocation, setNewAllocation] = useState<Allocation>({
    _id: initialAllocation?._id || '',
    category: initialAllocation?.category || '',
    type: initialAllocation?.type || 'amount', // Highlighted change: Use type from initialAllocation
    value: initialAllocation?.value || 0,
    priority: initialAllocation?.priority || 1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialAllocation) {
      setNewAllocation(initialAllocation);
    }
  }, [initialAllocation]);

  const handleInputChange = (key: keyof Allocation, value: string | number) => {
    setNewAllocation((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate category and value
      if (!newAllocation.category || newAllocation.value <= 0) {
        alert('Please provide a valid category and value.');
        return;
      }

      // Validate total percentage for `percentage` and `overflow` types
      if (newAllocation.type === 'percentage' || newAllocation.type === 'overflow') {
        const totalPercentage = allocations
          .filter((a) => a.type === 'percentage' || a.type === 'overflow')
          .reduce((sum, a) => sum + a.value, 0);

        if (totalPercentage + newAllocation.value > 100) {
          alert('Total percentage cannot exceed 100%.');
          return;
        }
      }

      // Prevent negative priority
      if (newAllocation.priority < 1) {
        alert('Priority must be at least 1.');
        return;
      }

      // Prevent priority greater than 99
      if (newAllocation.priority > 99) {
        alert('Priority must not exceed 99.');
        return;
      }

      await onAdd(newAllocation);
      setNewAllocation({ _id: '', category: '', type: 'amount', value: 0, priority: 1 });
    } catch (error) {
      console.error('Error submitting allocation:', error);
      alert('An error occurred while submitting the allocation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-md bg-card">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          {!initialAllocation && (
            <label htmlFor="new-allocation-category" className="block mb-1">
              Category
            </label>
          )}
          {initialAllocation ? (
            <p className="font-medium mt-8">{newAllocation.category}</p>
          ) : (
            <CategorySelect
              value={newAllocation.category}
              onChange={(value) => handleInputChange('category', value)}
              className="w-full"
            />
          )}
        </div>
        <div>
          <label htmlFor="new-allocation-type" className="block mb-1">
            Allocation Type
          </label>
          <AllocationTypeSelect
            value={newAllocation.type} // Use the type from state
            onChange={(value) => handleInputChange('type', value)}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="new-allocation-value" className="block mb-1">
            Value
          </label>
          <input
            id="new-allocation-value"
            type="number"
            value={newAllocation.value}
            onChange={(e) => handleInputChange('value', Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g., 100"
            required
          />
        </div>
        {newAllocation.type !== 'overflow' && (
          <div>
            <label htmlFor="new-allocation-priority" className="block mb-1">
              Priority
              <span className="text-sm text-muted-foreground ml-2">(Higher is first)</span>
            </label>
            <input
              id="new-allocation-priority"
              type="number"
              value={newAllocation.priority}
              onChange={(e) => {
                const value = Math.max(1, Math.min(99, Number(e.target.value)));
                handleInputChange('priority', value);
              }}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., 1"
            />
          </div>
        )}
      </div>
      <Button
        className="mt-4"
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        aria-label={newAllocation._id ? 'Update Allocation' : 'Add Allocation'}
        variant={document.documentElement.classList.contains('dark') ? 'outline' : 'default'}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Submitting...</span>
          </>
        ) : (
          <span>{newAllocation._id ? 'Update Allocation' : 'Add Allocation'}</span>
        )}
      </Button>
    </form>
  );
}
