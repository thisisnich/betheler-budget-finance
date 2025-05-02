'use client';

import { AddAllocationForm } from '@/components/AllocationForm';
import { AllocationList } from '@/components/AllocationList';
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
import type { SessionId } from 'convex-helpers/server/sessions';
import { useQuery } from 'convex/react';
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
  const sessionId =
    typeof window !== 'undefined' ? (localStorage.getItem('sessionId') as SessionId | null) : null;

  if (!sessionId) {
    console.error('Session ID is missing. Please log in.');
    return <div>Please log in to view your allocations.</div>;
  }

  const rawAllocations = useQuery(api.allocation.getAllocations, { sessionId }) || [];
  const allocations: Allocation[] = rawAllocations.map((allocation) => ({
    _id: allocation._id?.toString(),
    category: allocation.category,
    type: allocation.type as 'amount' | 'percentage' | 'overflow',
    value: allocation.value,
    priority: allocation.priority,
  }));

  const [isAddingAllocation, setIsAddingAllocation] = useState(false);

  return (
    <RequireLogin>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="Manage Allocations"
            description="Set fixed amounts, percentages, or overflow percentages for each category."
          />

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
              <AddAllocationForm
                onSuccess={() => setIsAddingAllocation(false)}
                allocations={allocations}
              />
            </DialogContent>
          </Dialog>

          <AllocationList />
        </div>
      </div>
    </RequireLogin>
  );
}
