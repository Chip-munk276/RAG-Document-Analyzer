package com.AIR.docAnlz.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmbeddingService {

    private final VectorStore vectorStore;
    private final JdbcTemplate jdbcTemplate;

    public EmbeddingService(
            VectorStore vectorStore,
            JdbcTemplate jdbcTemplate
    ) {
        this.vectorStore = vectorStore;
        this.jdbcTemplate = jdbcTemplate;
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

    @Transactional
    public int deleteDocumentVectors(Long documentId) {

        if (documentId == null || documentId <= 0) {
            throw new IllegalArgumentException(
                    "A valid document ID is required"
            );
        }

        String sql = """
                DELETE FROM public.vector_store
                WHERE (metadata ->> 'documentId')::bigint = ?
                """;

        int deletedRows = jdbcTemplate.update(
                sql,
                documentId
        );

        return deletedRows;
    }
}
