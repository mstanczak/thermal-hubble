import { get, set, del, keys } from 'idb-keyval';

export interface LocalDocument {
    id: string;
    name: string;
    content: string; // Extracted text
    weight: number; // 0-100
    type: 'pdf' | 'text';
    timestamp: number;
}

const STORE_KEY_PREFIX = 'doc_';

export const StorageManager = {
    async saveDocument(doc: LocalDocument): Promise<void> {
        await set(STORE_KEY_PREFIX + doc.id, doc);
    },

    async getDocument(id: string): Promise<LocalDocument | undefined> {
        return await get(STORE_KEY_PREFIX + id);
    },

    async getAllDocuments(): Promise<LocalDocument[]> {
        const allKeys = await keys();
        const docKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(STORE_KEY_PREFIX));

        // Fetch all docs in parallel
        const docs = await Promise.all(
            docKeys.map(key => get<LocalDocument>(key))
        );

        // Filter out any undefined results and sort by timestamp desc
        return docs
            .filter((d): d is LocalDocument => !!d)
            .sort((a, b) => b.timestamp - a.timestamp);
    },

    async deleteDocument(id: string): Promise<void> {
        await del(STORE_KEY_PREFIX + id);
    }
};
