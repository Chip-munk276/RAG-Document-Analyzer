package com.AIR.docAnlz.repository;

import com.AIR.docAnlz.model.ChatMessage;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository
        extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage>
    findAllBySessionIdOrderByCreatedAtAsc(
            Long sessionId
    );
}