package com.AIR.docAnlz.service;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmbeddingService {

    private final VectorStore vectorStore;

    public EmbeddingService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public void embedAndStore(List<Document> chunks) {

        if (chunks == null || chunks.isEmpty()) {
            throw new RuntimeException(
                    "No document chunks available for embedding"
            );
        }

        try {
            vectorStore.add(chunks);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate embeddings and store document chunks",
                    e
            );
        }
    }
}
