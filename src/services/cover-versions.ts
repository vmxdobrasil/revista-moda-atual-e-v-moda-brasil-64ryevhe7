import pb from '@/lib/pocketbase/client'

export interface CoverData {
  imageUrl: string
  title: string
  subtitle: string
  altText: string
  stockSource: string
  theme: string
}

export interface CoverVersion {
  id: string
  edition: string
  version_number: number
  cover_image: string
  cover_alt_text: string
  cover_variants: CoverData | null
  created: string
  updated: string
}

export async function getCoverVersions(editionId: string): Promise<CoverVersion[]> {
  const result = await pb.collection('cover_versions').getFullList({
    filter: `edition = "${editionId}"`,
    sort: '-version_number',
  })
  return result as unknown as CoverVersion[]
}

export async function createCoverVersion(
  editionId: string,
  coverData: CoverData,
): Promise<CoverVersion> {
  const existing = await pb.collection('cover_versions').getFullList({
    filter: `edition = "${editionId}"`,
    sort: '-version_number',
    perPage: 1,
  })
  const nextVersion =
    existing.length > 0 ? (existing[0] as unknown as CoverVersion).version_number + 1 : 1

  const record = await pb.collection('cover_versions').create({
    edition: editionId,
    version_number: nextVersion,
    cover_alt_text: coverData.altText,
    cover_variants: coverData,
  })
  return record as unknown as CoverVersion
}

export async function restoreCoverVersion(versionId: string): Promise<void> {
  const version = (await pb
    .collection('cover_versions')
    .getOne(versionId)) as unknown as CoverVersion
  const editionId = version.edition
  const coverVariants = version.cover_variants
  const coverAltText = version.cover_alt_text

  const updateData: Record<string, unknown> = {
    cover_alt_text: coverAltText,
    cover_variants: coverVariants,
  }
  if (coverVariants?.imageUrl) {
    updateData.cover_url = coverVariants.imageUrl
  }

  await pb.collection('editions').update(editionId, updateData)
}

export async function deleteCoverVersion(versionId: string): Promise<void> {
  await pb.collection('cover_versions').delete(versionId)
}
