export function LoadingState() {
  return (
    <div className="grid grid-cols-2 gap-4 px-5 py-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-[20px] overflow-hidden shadow-sm animate-pulse">
          {/* Image skeleton */}
          <div className="aspect-square bg-[#FFF0F0]" />
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="h-4 bg-[#FFF0F0] rounded-full w-3/4" />
            <div className="h-4 bg-[#FFF0F0] rounded-full w-1/2" />
            <div className="h-3 bg-[#FFF0F0] rounded-full w-full" />
            <div className="h-10 bg-[#FFF0F0] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
