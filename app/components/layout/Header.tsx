import { ThemeToggle } from "../ui/ThemeToggle";

export default function Header() {
  return (
    <div className='flex justify-between items-center'>
      <div className='text-center flex-1'>
        <h1 className='text-4xl font-bold text-foreground mb-2'>
          Vinyl Tag Maker with Discogs
        </h1>
      </div>
      <div className='flex items-center gap-2'>
        <ThemeToggle />
      </div>
    </div>
  );
}
