import Link from 'next/link';

export default function CitiesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Cities</h1>
      <Link href="/dashboard" className="text-blue-600 hover:underline">
        Go to Dashboard
      </Link>
    </div>
  );
}
