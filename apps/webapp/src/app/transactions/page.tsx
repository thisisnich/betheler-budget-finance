'use client';

import { PageHeader } from '@/components/PageHeader';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { Button } from '@/components/ui/button';
import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons';
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

  const actionButton = (
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
  );

  return (
    <div className="container py-4 sm:py-8 px-4 sm:px-6 max-w-3xl mx-auto">
      <PageHeader title="Transactions" action={actionButton} />

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
