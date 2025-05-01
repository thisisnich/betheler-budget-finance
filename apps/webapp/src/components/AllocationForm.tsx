import { CategorySelect } from '@/components/CategorySelect';
import type { Allocation } from '@/types/schema';
import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionMutation, useSessionQuery } from 'convex-helpers/react/sessions'; // Import the query hook
import { useEffect, useState } from 'react';

// Example: Replace this with your actual session retrieval logic
const useSessionId = () => {
  // Replace with your actual logic to retrieve the session ID
  return 'your-session-id';
};

interface AddAllocationFormProps {
  onAdd: (allocation: Allocation) => Promise<void>;
  initialAllocation?: Allocation;
  allocations?: Allocation[]; // Allow undefined
}
export function AddAllocationForm({
  onSuccess,
  initialAllocation,
  allocations,
}: {
  onSuccess: () => void; // Callback to notify the parent when an allocation is added
  initialAllocation?: Allocation;
  allocations: Allocation[];
}) {
  const [newAllocation, setNewAllocation] = useState<Allocation>({
    _id: '',
    category: '',
    type: 'amount',
    value: 0,
    priority: 1,
  });

  const sessionId = useSessionId(); // Retrieve the session ID dynamically
  const createOrUpdateAllocation = useSessionMutation(api.allocation.upsertAllocation);

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

    // Check for conflicting priorities
    const hasConflictingPriority = allocations.some(
      (allocation) =>
        allocation.priority === newAllocation.priority && allocation._id !== newAllocation._id
    );

    if (hasConflictingPriority) {
      alert(
        `Priority ${newAllocation.priority} is already assigned to another allocation. Please choose a unique priority.`
      );
      return;
    }

    // Submit the allocation
    try {
      await createOrUpdateAllocation({
        category: newAllocation.category,
        type: newAllocation.type,
        value: newAllocation.value,
        priority: newAllocation.priority,
      });
      onSuccess(); // Notify the parent component
    } catch (error) {
      console.error('Error adding allocation:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 p-4 border rounded-md bg-card text-card-foreground dark:bg-card dark:text-card-foreground"
    >
      {/* Form fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category Field */}
        <div className="col-span-1">
          {!initialAllocation && (
            <label
              htmlFor="new-allocation-category"
              className="block mb-1 text-muted-foreground dark:text-muted-foreground"
            >
              Category
            </label>
          )}
          {initialAllocation ? (
            <p className="font-medium mt-8">{newAllocation.category}</p>
          ) : (
            <CategorySelect
              value={newAllocation.category}
              onChange={(value) => handleInputChange('category', value)}
              className="w-full border rounded px-3 py-2 bg-input text-foreground dark:bg-input dark:text-foreground"
            />
          )}
        </div>

        {/* Type Field */}
        <div className="col-span-1">
          <label
            htmlFor="new-allocation-type"
            className="block mb-1 text-muted-foreground dark:text-muted-foreground"
          >
            Type
          </label>
          <select
            id="new-allocation-type"
            value={newAllocation.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full border rounded px-3 py-2 bg-input text-foreground dark:bg-input dark:text-foreground"
          >
            <option value="amount">Fixed Amount</option>
            <option value="percentage">Percentage</option>
            <option value="overflow">Overflow Percentage</option>
          </select>
        </div>

        {/* Value Field */}
        <div className="col-span-1">
          <label
            htmlFor="new-allocation-value"
            className="block mb-1 text-muted-foreground dark:text-muted-foreground"
          >
            Value
          </label>
          <input
            id="new-allocation-value"
            type="number"
            value={newAllocation.value}
            onChange={(e) => handleInputChange('value', Number(e.target.value))}
            className="w-full border rounded px-3 py-2 bg-input text-foreground dark:bg-input dark:text-foreground"
            placeholder="e.g., 100"
            required
          />
        </div>

        {/* Priority Field */}
        {newAllocation.type !== 'overflow' && (
          <div className="col-span-1">
            <label
              htmlFor="new-allocation-priority"
              className="block mb-1 text-muted-foreground dark:text-muted-foreground"
            >
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
              className="w-full border rounded px-3 py-2 bg-input text-foreground dark:bg-input dark:text-foreground"
              placeholder="e.g., 1"
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary-dark dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary-dark"
      >
        {newAllocation._id ? 'Update Allocation' : 'Add Allocation'}
      </button>
    </form>
  );
}
