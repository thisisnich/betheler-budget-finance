import type { Allocation } from '@/types/schema';
import { api } from '@workspace/backend/convex/_generated/api';
import { useSessionMutation } from 'convex-helpers/react/sessions';
import { Edit2Icon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { AddAllocationForm } from './AllocationForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';

type AllocationType = 'amount' | 'percentage' | 'overflow';

interface AllocationCardProps {
  allocation: Allocation; // Individual allocation
  allocations?: Allocation[]; // Optional full list of allocations
}

export function AllocationCard({ allocation }: AllocationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const deleteAllocation = useSessionMutation(api.allocation.deleteAllocation);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete the allocation for "${allocation.category}"?`)) {
      try {
        await deleteAllocation({ category: allocation.category });
      } catch (error) {
        console.error('Error deleting allocation:', error);
      }
    }
  };

  return (
    <div className="p-4 border rounded-md bg-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">{allocation.category}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-gray-500 hover:text-gray-600"
            aria-label={`Edit allocation for ${allocation.category}`}
          >
            <Edit2Icon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600"
            aria-label={`Delete allocation for ${allocation.category}`}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-sm text-muted-foreground">Type</p>
          <p className="font-medium">{allocation.type}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            {allocation.type === 'amount' ? 'Fixed Amount ($)' : 'Percentage (%)'}
          </p>
          <p className="font-medium">{allocation.value}</p>
        </div>
        {allocation.type !== 'overflow' && (
          <div>
            <p className="text-sm text-muted-foreground">Priority</p>
            <p className="font-medium">{allocation.priority}</p>
          </div>
        )}
        {allocation.type === 'amount' && allocation.alwaysAdd && (
          <div>
            <p className="text-sm text-muted-foreground">Always Add</p>
            <p className="font-medium text-green-600">Enabled</p>
          </div>
        )}
      </div>
      {/* Edit Allocation Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Allocation</DialogTitle>
          </DialogHeader>
          <AddAllocationForm onSuccess={() => setIsEditing(false)} initialAllocation={allocation} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
