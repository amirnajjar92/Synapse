export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero skeleton */}
      <div className="relative w-full h-96 bg-gradient-to-br from-[#EF0606]/30 to-[#3B82F6]/30 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8">
          <div className="container mx-auto max-w-4xl">
            <div className="h-4 w-24 bg-[#F5F0EB]/10 rounded mb-4" />
            <div className="h-10 w-3/4 bg-[#F5F0EB]/10 rounded mb-4" />
            <div className="h-4 w-32 bg-[#F5F0EB]/10 rounded" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-9">
              <div className="space-y-4">
                <div className="h-4 w-full bg-[#F5F0EB]/5 rounded" />
                <div className="h-4 w-5/6 bg-[#F5F0EB]/5 rounded" />
                <div className="h-4 w-4/6 bg-[#F5F0EB]/5 rounded" />
                <div className="h-4 w-full bg-[#F5F0EB]/5 rounded" />
                <div className="h-4 w-3/4 bg-[#F5F0EB]/5 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
