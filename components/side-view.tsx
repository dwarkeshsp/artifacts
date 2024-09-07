import { ArtifactView } from '@/components/artifact-view'
import { ArtifactSchema } from '@/lib/schema'

export function SideView({
  isLoading,
  artifact,
}: {
  isLoading: boolean
  artifact?: ArtifactSchema
}) {
  if (!artifact) {
    return null
  }

  return (
    <div className="flex-1 flex flex-col shadow-2xl rounded-lg border border-[#FFE7CC] bg-white max-w-[800px]">
      <div className="w-full p-2 bg-[#FAFAFA] rounded-t-lg border-b border-[#FFE7CC]">
        <div className='flex justify-start'>
          {isLoading && <div className="h-4 w-4 text-black/15 animate-spin">Loading...</div>}
        </div>
      </div>
      <div className="w-full flex-1 flex flex-col items-start justify-start overflow-y-auto">
        <ArtifactView artifact={artifact} />
      </div>
    </div>
  )
}
