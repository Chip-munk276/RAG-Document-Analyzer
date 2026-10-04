package com.AIR.docAnlz.repository;

import com.AIR.docAnlz.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findAllByOwnerIdOrderByUploadedAtDesc(
            Long ownerId
    );

    Optional<Document> findByIdAndOwnerId(
            Long documentId,
            Long ownerId
    );
}
