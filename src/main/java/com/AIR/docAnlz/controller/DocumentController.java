package com.AIR.docAnlz.controller;

import com.AIR.docAnlz.model.Document;
import com.AIR.docAnlz.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/documents")
public class DocumentController {
    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Document> uploadDocument(
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        return ResponseEntity.ok(
                documentService.uploadDocument(file)
        );
    }

    @GetMapping
    public ResponseEntity<List<Document>> getDocuments() {

        return ResponseEntity.ok(
                documentService.getAllDocuments()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocument(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                documentService.getDocument(id)
        );
    }
}
