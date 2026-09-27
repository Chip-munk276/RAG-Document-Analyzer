package com.AIR.docAnlz.service;

import com.AIR.docAnlz.model.Document;
import com.AIR.docAnlz.repository.DocumentRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
@Service
public class DocumentService {

    private static final Logger logger =
            LoggerFactory.getLogger(DocumentService.class);

    private final DocumentRepository documentRepository;

    public DocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    public Document uploadDocument(MultipartFile file) throws IOException {

        Document document = Document.builder()
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .uploadedAt(LocalDateTime.now())
                .build();

        if (file.isEmpty()) {
            throw new RuntimeException("Uploaded file is empty");
        }

        if (!"application/pdf".equals(file.getContentType())) {
            throw new RuntimeException("Only PDF files are supported");
        }

        logger.info("Document uploaded successfully");
        return documentRepository.save(document);
    }

    public List<Document> getAllDocuments() {
        logger.info("Fetching all documents");
        return documentRepository.findAll();
    }

    public Document getDocument(Long id) {

        logger.info("Fetching document with ID: {}", id);
        return documentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Document with ID " + id + " not found"
                        ));
    }
}
