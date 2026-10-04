package com.AIR.docAnlz.service;

import com.AIR.docAnlz.model.Document;
import com.AIR.docAnlz.model.User;
import com.AIR.docAnlz.repository.DocumentRepository;
import com.AIR.docAnlz.repository.UserRepository;
import com.AIR.docAnlz.security.CurrentUserService;

import org.springframework.ai.document.DocumentReader;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.core.io.InputStreamResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DocumentService {

    private static final Logger logger =
            LoggerFactory.getLogger(DocumentService.class);

    private final EmbeddingService embeddingService;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public DocumentService(DocumentRepository documentRepository,
                           EmbeddingService embeddingService,
                           UserRepository userRepository,
                           CurrentUserService currentUserService
    ) {
        this.documentRepository = documentRepository;
        this.embeddingService = embeddingService;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    public Document uploadDocument(MultipartFile file) throws IOException {

        Long userId =
                currentUserService.getCurrentUserId();

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        if (file.isEmpty()) {
            throw new RuntimeException("Uploaded file is empty");
        }

        if (!"application/pdf".equals(file.getContentType())) {
            throw new RuntimeException("Only PDF files are supported");
        }

        // Save Document Metadata first to get generated ID
        Document document = Document.builder()
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .uploadedAt(LocalDateTime.now())
                .owner(user)
                .build();
        document = documentRepository.save(document);

        logger.info("Document saved with ID: {}", document.getId());

        // Parse PDF
        InputStream inputStream = file.getInputStream();
        InputStreamResource resource =
                new InputStreamResource(inputStream);
        DocumentReader reader =
                new PagePdfDocumentReader(resource);
        List<org.springframework.ai.document.Document> pages =
                reader.get();

        // Add metadata to pages
        for (org.springframework.ai.document.Document page : pages) {
            page.getMetadata().put("documentId", document.getId());
        }

        // Chunking
        TokenTextSplitter splitter = TokenTextSplitter.builder()
                .withChunkSize(500)
                .withMinChunkSizeChars(100)
                .withMinChunkLengthToEmbed(5)
                .withMaxNumChunks(1000)
                .withKeepSeparator(true)
                .build();

        List<org.springframework.ai.document.Document> chunks =
                splitter.apply(pages);

        //Ensure metadata is preserved on all chunks
        for (org.springframework.ai.document.Document chunk : chunks) {
            chunk.getMetadata().put("documentId", document.getId());
        }

        // Store chunks + embeddings
        embeddingService.embedAndStore(chunks);

        return document;
    }

    public List<Document> getAllDocuments() {
        logger.info("Fetching all documents");
        Long userId =
                currentUserService.getCurrentUserId();

        return documentRepository
                .findAllByOwnerIdOrderByUploadedAtDesc(
                        userId
                );
    }

    public Document getDocument(Long id) {

        logger.info("Fetching document with ID: {}", id);
        Long userId =
                currentUserService.getCurrentUserId();

        return documentRepository
                .findByIdAndOwnerId(
                        id,
                        userId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Document with ID " + id + " not found"
                        ));
    }
}
