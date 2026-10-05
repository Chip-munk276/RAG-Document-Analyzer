package com.AIR.docAnlz.repository;

import com.AIR.docAnlz.model.ChatSession;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatSessionRepository
        extends JpaRepository<ChatSession, Long> {

    Optional<ChatSession>
    findFirstByUserIdAndDocumentIdOrderByCreatedAtAsc(
            Long userId,
            Long documentId
    );
}