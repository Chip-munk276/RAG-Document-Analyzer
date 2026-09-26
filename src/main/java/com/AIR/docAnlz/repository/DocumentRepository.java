package com.AIR.docAnlz.repository;

import com.AIR.docAnlz.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Long> {
}
