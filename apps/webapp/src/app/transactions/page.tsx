'use client';

import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, Cross2Icon, PlusIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useState } from 'react';

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
    <div className="container py-4 sm:py-8 px-4 sm:px-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/app">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeftIcon className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
        <Button
          onClick={toggleForm}
          variant={showForm ? 'outline' : 'default'}
          className="w-full sm:w-auto"
        >
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
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 border rounded-lg bg-card">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">New Transaction</h2>
          <TransactionForm onSuccess={handleTransactionAdded} />
        </div>
      )}

      <TransactionList />
    </div>
  );
}
