'use client';

import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

export function ShareNotFound() {
  return (
    <div className="container py-6 px-4 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Share Not Found</h1>
        <p className="text-muted-foreground mb-6">
          This share link may have expired or been deleted.
        </p>
        <Link href="/app">
          <Button variant="outline" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
