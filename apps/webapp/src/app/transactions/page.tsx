'use client';

import { useState } from 'react';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { Button } from '@/components/ui/button';
import { PlusIcon, Cross2Icon } from '@radix-ui/react-icons';

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  
  const toggleForm = () => {
    setShowForm(!showForm);
  };
  
  const handleTransactionAdded = () => {
    // Optionally hide the form after a transaction is added
    setShowForm(false);
  };
  
  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Button onClick={toggleForm} variant={showForm ? "outline" : "default"}>
          {showForm ? (
            <>
              <Cross2Icon className="mr-2 h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Transaction
            </>
          )}
        </Button>
      </div>
      
      {showForm && (
        <div className="mb-8 p-6 border rounded-lg bg-card">
          <h2 className="text-2xl font-semibold mb-4">New Transaction</h2>
          <TransactionForm onSuccess={handleTransactionAdded} />
        </div>
      )}
      
      <TransactionList />
    </div>
  );
} 