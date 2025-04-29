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
  onChange: (key: keyof Allocation, value: string | number) => void;
  onDelete: () => void;
}

export function AllocationCard({ allocation, onChange, onDelete }: AllocationCardProps) {
  const idPrefix = `allocation-${allocation._id}`;

  return (
    <div className="p-4 border rounded-md bg-card">
      <h3 className="font-medium mb-2">{allocation.category}</h3>
      <div className="space-y-2">
        <div>
          <label htmlFor={`${idPrefix}-type`} className="block mb-1">
            Allocation Type
          </label>
          <select
            id={`${idPrefix}-type`}
            value={allocation.type}
            onChange={(e) => onChange('type', e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="amount">Fixed Amount</option>
            <option value="percentage">Percentage</option>
            <option value="overflow">Overflow Percentage</option>
          </select>
        </div>

        <div>
          <label htmlFor={`${idPrefix}-value`} className="block mb-1">
            {allocation.type === 'amount' ? 'Fixed Amount ($)' : 'Percentage (%)'}
          </label>
          <input
            id={`${idPrefix}-value`}
            type="number"
            value={allocation.value}
            onChange={(e) => onChange('value', Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {allocation.type !== 'overflow' && (
          <div>
            <label htmlFor={`${idPrefix}-priority`} className="block mb-1">
              Priority
            </label>
            <input
              id={`${idPrefix}-priority`}
              type="number"
              value={allocation.priority}
              onChange={(e) => onChange('priority', Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        )}

        <button
          type="button"
          onClick={onDelete}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
