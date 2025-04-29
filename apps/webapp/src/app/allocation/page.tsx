'use client';

import { PageHeader } from '@/components/PageHeader';
import { RequireLogin } from '@/modules/auth/RequireLogin';
import { api } from '@workspace/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';

import { AddAllocationForm } from '@/components/AllocationForm';
import { AllocationList } from '@/components/AllocationList';
import type { Allocation, AllocationType } from '@/types/schema'; // Import the shared Allocation type

export default function BudgetsPage() {
  // Fetch allocations from the backend and transform the data
  const rawAllocations = useQuery(api.allocation.getAllocations) || [];
  const allocations: Allocation[] = rawAllocations.map((allocation) => ({
    _id: allocation._id?.toString(), // Convert _id to string
    category: allocation.category,
    type: allocation.type as AllocationType, // Cast type to AllocationType
    value: allocation.value,
    priority: allocation.priority,
  }));

  // Define mutations for create, update, and delete operations
  const createOrUpdateAllocation = useMutation(api.allocation.upsertAllocation);
  const deleteAllocation = useMutation(api.allocation.deleteAllocation);

  // Handle adding a new allocation
  const handleAddAllocation = async (allocation: Allocation) => {
    try {
      await createOrUpdateAllocation({
        category: allocation.category,
        type: allocation.type,
        value: allocation.value,
        priority: allocation.priority,
      });
    } catch (error) {
      console.error('Error adding allocation:', error);
    }
  };

  // Handle updating an existing allocation
  const handleAllocationChange = async (
    allocationId: string,
    key: keyof Allocation,
    value: string | number
  ) => {
    const allocation = allocations.find((a) => a._id === allocationId);

    if (!allocation) {
      console.error(`Allocation with ID ${allocationId} not found.`);
      return;
    }

    const updatedAllocation = {
      ...allocation,
      [key]: value,
    };

    try {
      await createOrUpdateAllocation({
        category: updatedAllocation.category,
        type: updatedAllocation.type as AllocationType,
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
        await deleteAllocation({ category: allocation.category });
      } catch (error) {
        console.error('Error deleting allocation:', error);
      }
    }
  };

  return (
    <RequireLogin>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="Configure Your Budget Allocations"
            description="Set fixed amounts, percentages, or overflow percentages for each category."
          />
          {/* Add Allocation Form */}
          <AddAllocationForm onAdd={handleAddAllocation} />
          {/* Allocation List */}
          <AllocationList
            allocations={allocations}
            onChange={handleAllocationChange}
            onDelete={handleDeleteAllocation}
          />
        </div>
      </div>
    </RequireLogin>
  );
}
