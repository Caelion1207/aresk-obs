import { ChromaClient, Collection } from 'chromadb';

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const COLLECTION_NAME = "wabun_memory_v1";

const client = new ChromaClient({ path: CHROMA_URL });
let collectionCache: Collection | null = null;

async function getCollection(): Promise<Collection | null> {
  if (collectionCache) return collectionCache;
  try {
    collectionCache = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
      metadata: { "description": "ARESK Semantic Index - WABUN Sidecar" }
    });
    return collectionCache;
  } catch (error) {
    console.warn(`⚠️ WABUN: Vector DB unavailable at ${CHROMA_URL}. Skipping op.`);
    return null;
  }
}

export async function safeIndexMessage(
  id: number | string, 
  content: string, 
  metadata: Record<string, any>
) {
  try {
    const coll = await getCollection();
    if (!coll) return;

    // Sanitización de tipos para ChromaDB (solo string, number, bool)
    const safeMetadata: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (value !== null && value !== undefined) {
        safeMetadata[key] = value;
      }
    }

    await coll.upsert({
      ids: [String(id)],
      documents: [content],
      metadatas: [safeMetadata as any]
    });

  } catch (error) {
    console.error(`⚠️ WABUN: Indexing failed for ${id}`, error);
  }
}
