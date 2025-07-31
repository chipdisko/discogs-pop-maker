interface ErrorDisplayProps {
  error: string | null;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className='bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded'>
      <div className='flex items-center space-x-2'>
        <span className='text-destructive'>⚠️</span>
        <span>{error}</span>
      </div>
    </div>
  );
}
