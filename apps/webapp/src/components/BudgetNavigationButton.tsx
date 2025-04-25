import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

interface BudgetNavigationButtonProps {
  className?: string;
}

export function BudgetNavigationButton({ className }: BudgetNavigationButtonProps) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/budgets');
  };

  return (
    <Button onClick={handleNavigate} variant="outline" className={className}>
      Set Up Your Budget
    </Button>
  );
}
