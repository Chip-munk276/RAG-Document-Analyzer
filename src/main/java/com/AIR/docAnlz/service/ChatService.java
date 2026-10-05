package com.AIR.docAnlz.service;

import com.AIR.docAnlz.dto.ChatResponse;

import com.AIR.docAnlz.model.*;
import com.AIR.docAnlz.repository.*;
import com.AIR.docAnlz.security.CurrentUserService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {
    FilterExpressionBuilder b = new FilterExpressionBuilder();
    private static final Logger logger =
            LoggerFactory.getLogger(ChatService.class);

    private final ChatClient chatClient;
    private final VectorStore vectorStore;

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;

    private final CurrentUserService currentUserService;

    public ChatService(
            ChatClient.Builder chatClientBuilder,
            VectorStore vectorStore,
            DocumentRepository documentRepository,
            UserRepository userRepository,
            ChatSessionRepository chatSessionRepository,
            ChatMessageRepository chatMessageRepository,
            CurrentUserService currentUserService
    ) {
        this.chatClient = chatClientBuilder.build();
        this.vectorStore = vectorStore;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.currentUserService = currentUserService;
    }

    public ChatResponse chat(Long documentId, String question) {

        logger.info(
                "Chat request received for document ID: {}",
                documentId
        );

        Long userId = currentUserService.getCurrentUserId();
        com.AIR.docAnlz.model.Document document = documentRepository
                .findByIdAndOwnerId(
                        documentId,
                        userId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Document not found"
                        )
                );

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        ChatSession session =
                chatSessionRepository
                        .findFirstByUserIdAndDocumentIdOrderByCreatedAtAsc(
                                userId,
                                documentId
                        )
                        .orElseGet(() -> {
                            ChatSession s = new ChatSession();
                            s.setUser(user);
                            s.setDocument(document);
                            return chatSessionRepository.save(s);
                        });

        String context = "";

        try {
            // Perform vector similarity search
            List<Document> relevantChunks = vectorStore.similaritySearch(
                    SearchRequest.builder()
                            .query(question)
                            .topK(15)
                            .filterExpression(b.eq("documentId", documentId).build())
                            .build()
            );

            // check if anything is found
            if (relevantChunks.isEmpty()) {

                //Save chat
                saveChatHistory(
                        session,
                        question,
                        "I could not find relevant information in this document."
                );

                return new ChatResponse(
                        documentId,
                        question,
                        "I could not find relevant information in this document."
                );
            }

            // Extract text from retrieved chunks
            context = relevantChunks.stream()
                    .map(Document::getText)
                    .collect(Collectors.joining("\n\n---\n\n"));

        } catch (Exception ex) {
            logger.error(
                    "Failed to retrieve context for document ID: {}",
                    documentId,
                    ex
            );
            throw ex;
        }

        String answer;
        //Send the retrieved context + question to the LLM
        try {
            answer = chatClient
                    .prompt()
                    .system("""
                            You are an intelligent document analysis assistant.
                            
                            Answer the user's question using ONLY the
                            information provided in the document context.
                            
                            If the answer cannot be found in the context,
                            clearly state that the information is not available
                            in the document.
                            
                            Do not invent facts.
                            Do not use outside knowledge.
                            
                            DOCUMENT CONTEXT:
                            """ + context)
                    .user(question)
                    .call()
                    .content();

            logger.info(
                    "Chat response generated for document ID: {}",
                    documentId
            );

            //Save chat
            saveChatHistory(
                    session,
                    question,
                    answer
            );

            //Return answer
            return new ChatResponse(
                    documentId,
                    question,
                    answer
            );
        } catch (Exception e) {
            logger.error(
                    "Failed to generate chat response for document ID: {}",
                    documentId,
                    e
            );
            throw e;
        }
    }

    //Save user question and assistant answer
    private void saveChatHistory(
            ChatSession session,
            String question,
            String answer
    ) {

        // USER message
        ChatMessage userMessage = new ChatMessage();
        userMessage.setSession(session);
        userMessage.setRole(
                MessageRole.USER
        );
        userMessage.setContent(
                question
        );
        chatMessageRepository.save(
                userMessage
        );

        // ASSISTANT message
        ChatMessage assistantMessage = new ChatMessage();
        assistantMessage.setSession(session);
        assistantMessage.setRole(
                MessageRole.ASSISTANT
        );
        assistantMessage.setContent(
                answer
        );
        chatMessageRepository.save(
                assistantMessage
        );

        logger.info(
                "Chat history saved for session ID: {}",
                session.getId()
        );
    }

    // get chat history
    public List<ChatMessage> getHistory(
            Long documentId
    ) {

        Long userId = currentUserService.getCurrentUserId();

        documentRepository
                .findByIdAndOwnerId(
                        documentId,
                        userId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Document not found"
                        )
                );

        ChatSession session =
                chatSessionRepository
                        .findFirstByUserIdAndDocumentIdOrderByCreatedAtAsc(
                                userId,
                                documentId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Chat history not found"
                                )
                        );

        return chatMessageRepository
                .findAllBySessionIdOrderByCreatedAtAsc(
                        session.getId()
                );
    }
}
