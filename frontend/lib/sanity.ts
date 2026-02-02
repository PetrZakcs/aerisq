import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'your_project_id'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = '2024-01-28'

export const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
    return builder.image(source)
}
