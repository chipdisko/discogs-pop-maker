import { ThemeToggle } from "../ui/ThemeToggle";

interface HeaderProps {
  onClearStorage: () => void;
}

export default function Header({ onClearStorage }: HeaderProps) {
  return (
    <div className='flex justify-between items-center'>
      <div className='text-center flex-1'>
        <h1 className='text-4xl font-bold text-foreground mb-2'>
          Discogs Pop Maker
        </h1>
        <p className='text-muted-foreground'>
          レコード屋さんのポップを簡単作成✨
        </p>
      </div>
      <div className='flex items-center gap-2'>
        <button
          onClick={onClearStorage}
          className='px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600'
        >
          クリア（テスト用）
        </button>
        <ThemeToggle />
      </div>
    </div>
  );
}
