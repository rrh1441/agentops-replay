interface ReplayProgressProps {
  progress: number;
  isActive: boolean;
}

export function ReplayProgress({ progress, isActive }: ReplayProgressProps) {
  if (!isActive) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-blue-100 h-2">
        <div 
          className="bg-blue-500 h-full transition-all duration-300 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-0 h-full w-1 bg-blue-600 animate-pulse" />
        </div>
      </div>
      <div className="bg-white shadow-sm px-4 py-2 flex items-center justify-center gap-2">
        <div className="animate-spin text-lg">⚙️</div>
        <span className="text-sm font-medium text-gray-700">
          Replaying session... {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}