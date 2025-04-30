import { Edit2Icon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { AddAllocationForm } from './AllocationForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

type AllocationType = 'amount' | 'percentage' | 'overflow';

interface Allocation {
  _id: string;
  category: string;
  type: AllocationType;
  value: number;
  priority: number;
}

interface AllocationCardProps {
  allocation: Allocation;
  onChange: (updatedAllocation: Allocation) => void;
  onDelete: () => void;
}

export function AllocationCard({ allocation, onChange, onDelete }: AllocationCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditSuccess = async (updatedAllocation: Allocation): Promise<void> => {
    onChange(updatedAllocation); // Pass the updated allocation back to the parent
    setIsEditing(false); // Close the dialog
    return Promise.resolve(); // Ensure the function returns a Promise<void>
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
            onClick={onDelete}
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
      </div>

      {/* Edit Allocation Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogTitle>Edit Allocation</DialogTitle>
          <AddAllocationForm
            onAdd={handleEditSuccess} // Handle successful edit
            allocations={[]} // Pass other allocations for validation
            initialAllocation={allocation} // Pass the current allocation for editing
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
