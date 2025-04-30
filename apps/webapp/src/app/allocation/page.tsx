'use client';

import { AllocationCard } from '@/components/AllocationCard';
import { AddAllocationForm } from '@/components/AllocationForm';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { api } from '@workspace/backend/convex/_generated/api';
import type { SessionId } from 'convex-helpers/server/sessions'; // Import SessionId type
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';

// Define the Allocation type
interface Allocation {
  _id: string;
  category: string;
  type: 'amount' | 'percentage' | 'overflow';
  value: number;
  priority: number;
}

export default function AllocationsPage() {
  // Retrieve sessionId from localStorage
  const sessionId =
    typeof window !== 'undefined' ? (localStorage.getItem('sessionId') as SessionId | null) : null;

  if (!sessionId) {
    console.error('Session ID is missing. Please log in.');
    return <div>Please log in to view your allocations.</div>;
  }

  // Fetch allocations from the backend
  const rawAllocations = useQuery(api.allocation.getAllocations, { sessionId }) || [];
  const allocations: Allocation[] = rawAllocations.map((allocation) => ({
    _id: allocation._id?.toString(),
    category: allocation.category,
    type: allocation.type as 'amount' | 'percentage' | 'overflow',
    value: allocation.value,
    priority: allocation.priority,
  }));

  // Define mutations for create, update, and delete operations
  const createOrUpdateAllocation = useMutation(api.allocation.upsertAllocation);
  const deleteAllocation = useMutation(api.allocation.deleteAllocation);

  // State for managing the add allocation dialog
  const [isAddingAllocation, setIsAddingAllocation] = useState(false);

  // Handle adding a new allocation
  const handleAddAllocation = async (allocation: Omit<Allocation, '_id'>) => {
    try {
      await createOrUpdateAllocation({
        sessionId,
        category: allocation.category,
        type: allocation.type,
        value: allocation.value,
        priority: allocation.priority,
      });
      setIsAddingAllocation(false); // Close the dialog after adding
    } catch (error) {
      console.error('Error adding allocation:', error);
    }
  };

  // Handle updating an allocation
  // Handle updating an allocation
  const handleAllocationChange = async (updatedAllocation: Allocation) => {
    try {
      await createOrUpdateAllocation({
        sessionId,
        category: updatedAllocation.category,
        type: updatedAllocation.type,
        value: updatedAllocation.value,
        priority: updatedAllocation.priority,
      });
    } catch (error) {
      console.error('Error updating allocation:', error);
    }
  };
  // Handle deleting an allocation
  const handleDeleteAllocation = async (allocationId: string) => {
    const allocation = allocations.find((a) => a._id === allocationId);

    if (!allocation) {
      console.error(`Allocation with ID ${allocationId} not found.`);
      return;
    }

    if (confirm(`Are you sure you want to delete the allocation for "${allocation.category}"?`)) {
      try {
        await deleteAllocation({ sessionId, category: allocation.category });
      } catch (error) {
        console.error('Error deleting allocation:', error);
      }
    }
  };

  return (
    <RequireLogin>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <PageHeader
            title="Manage Allocations"
            description="Set fixed amounts, percentages, or overflow percentages for each category."
          />

          {/* Add Allocation Dialog */}
          <Dialog open={isAddingAllocation} onOpenChange={setIsAddingAllocation}>
            <DialogTrigger asChild>
              <Button variant="outline" className="mb-6">
                Add Allocation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Allocation</DialogTitle>
              </DialogHeader>
              <AddAllocationForm onAdd={handleAddAllocation} allocations={allocations} />
            </DialogContent>
          </Dialog>

          {/* Allocations List */}
          {allocations.length === 0 ? (
            <p className="text-center text-gray-500">
              No allocations found. Add some categories to get started.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allocations.map((allocation) => (
                <AllocationCard
                  key={allocation._id}
                  allocation={allocation}
                  onChange={(updatedAllocation) => handleAllocationChange(updatedAllocation)}
                  onDelete={() => handleDeleteAllocation(allocation._id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </RequireLogin>
  );
}
