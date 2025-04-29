import { CategorySelect } from '@/components/CategorySelect';
import type { Allocation } from '@/types/schema';
import { useEffect, useState } from 'react';

interface AddAllocationFormProps {
  onAdd: (allocation: Allocation) => Promise<void>;
  initialAllocation?: Allocation; // Optional prop for editing an existing allocation
}

export function AddAllocationForm({ onAdd, initialAllocation }: AddAllocationFormProps) {
  const [newAllocation, setNewAllocation] = useState<Allocation>({
    _id: '', // Include _id in the state
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
    if (!newAllocation.category || newAllocation.value <= 0) {
      alert('Please provide a valid category and value.');
      return;
    }

    await onAdd(newAllocation);
    setNewAllocation({ _id: '', category: '', type: 'amount', value: 0, priority: 1 });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-md bg-card">
      <h3 className="font-medium mb-4">
        {newAllocation._id ? 'Edit Allocation' : 'Add New Allocation'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="new-allocation-category" className="block mb-1">
            Category
          </label>
          <CategorySelect
            value={newAllocation.category}
            onChange={(value) => handleInputChange('category', value)}
            className="w-full"
          />
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
            </label>
            <input
              id="new-allocation-priority"
              type="number"
              value={newAllocation.priority}
              onChange={(e) => handleInputChange('priority', Number(e.target.value))}
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
