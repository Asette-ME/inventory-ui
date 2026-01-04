import Image from 'next/image';

import Home from '@/public/icons/home.png';

export default async function DashboardPage() {
  const HOME_ICON_SIZE = 48;
  const HOME_ICON_SIZE_MD = 68;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center gap-2">
        <Image
          src={Home}
          alt="Home"
          width={HOME_ICON_SIZE}
          height={HOME_ICON_SIZE}
          className={`md:w-[${HOME_ICON_SIZE_MD}px] md:h-[${HOME_ICON_SIZE_MD}px]`}
        />
        <h1 className="text-2xl md:text-3xl font-bold mb-0">Asette Inventory</h1>
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        <div className="bg-white dark:bg-muted/50 aspect-video rounded-xl shadow-sm border border-gray-200 dark:border-0" />
        <div className="bg-white dark:bg-muted/50 aspect-video rounded-xl shadow-sm border border-gray-200 dark:border-0" />
        <div className="bg-white dark:bg-muted/50 aspect-video rounded-xl shadow-sm border border-gray-200 dark:border-0" />
        <div className="bg-white dark:bg-muted/50 aspect-video rounded-xl shadow-sm border border-gray-200 dark:border-0" />
      </div>
      <div className="bg-white dark:bg-muted/50 shadow-sm border border-gray-200 dark:border-0 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
    </div>
  );
}
