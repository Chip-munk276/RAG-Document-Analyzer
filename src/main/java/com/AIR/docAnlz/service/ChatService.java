package com.AIR.docAnlz.service;

//import com.AIR.docAnlz.dto.ChatRequest;
import com.AIR.docAnlz.dto.ChatResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    private static final Logger logger =
            LoggerFactory.getLogger(ChatService.class);

    private final ChatClient chatClient;

    public ChatService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    public ChatResponse chat(Long documentId, String question) {

        logger.info(
                "Chat request received for document ID: {}",
                documentId
        );

        try {
            String answer = chatClient
                    .prompt()
                    .user(question)
                    .call()
                    .content();

            logger.info(
                    "Chat response generated for document ID: {}",
                    documentId
            );

            return new ChatResponse(answer);
        } catch (Exception ex) {
            logger.error(
                    "Failed to generate chat response for document ID: {}",
                    documentId,
                    ex
            );
            throw ex;
        }
    }
}
