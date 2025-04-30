import { CategorySelect } from '@/components/CategorySelect';
import type { Allocation } from '@/types/schema';
import { useEffect, useState } from 'react';

interface AddAllocationFormProps {
  onAdd: (allocation: Allocation) => Promise<void>;
  allocations: Allocation[]; // Existing allocations for validation
  initialAllocation?: Allocation; // Optional prop for editing an existing allocation
}

export function AddAllocationForm({
  onAdd,
  allocations,
  initialAllocation,
}: AddAllocationFormProps) {
  const [newAllocation, setNewAllocation] = useState<Allocation>({
    _id: '',
    category: '',
    type: 'amount',
    value: 0,
    priority: 1,
  });

  // Populate the form with the initial allocation if provided
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
  };
  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-md bg-card">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          {/* Only show the label if not editing */}
          {!initialAllocation && (
            <label htmlFor="new-allocation-category" className="block mb-1">
              Category
            </label>
          )}
          {initialAllocation ? (
            // Show plain text with additional spacing if editing
            <p className="font-medium mt-8">{newAllocation.category}</p>
          ) : (
            // Show dropdown if adding a new allocation
            <CategorySelect
              value={newAllocation.category}
              onChange={(value) => handleInputChange('category', value)}
              className="w-full"
            />
          )}
        </div>
        <div>
          <label htmlFor="new-allocation-type" className="block mb-1">
            Type
          </label>
          <select
            id="new-allocation-type"
            value={newAllocation.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="amount">Fixed Amount</option>
            <option value="percentage">Percentage</option>
            <option value="overflow">Overflow Percentage</option>
          </select>
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
                const value = Math.max(1, Math.min(99, Number(e.target.value))); // Clamp value between 1 and 99
                handleInputChange('priority', value);
              }}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., 1"
            />
          </div>
        )}
      </div>
      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
      >
        {newAllocation._id ? 'Update Allocation' : 'Add Allocation'}
      </button>
    </form>
  );
}
