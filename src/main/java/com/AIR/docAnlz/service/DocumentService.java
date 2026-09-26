package com.AIR.docAnlz.service;

import com.AIR.docAnlz.model.Document;
import com.AIR.docAnlz.repository.DocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
@Service
public class DocumentService {
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

        return documentRepository.save(document);
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    public Document getDocument(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Document not found"));
    }
}
