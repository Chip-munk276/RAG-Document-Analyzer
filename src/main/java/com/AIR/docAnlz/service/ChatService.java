package com.AIR.docAnlz.service;

import com.AIR.docAnlz.dto.ChatResponse;

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

    public ChatService(
            ChatClient.Builder chatClientBuilder,
            VectorStore vectorStore
    ) {
        this.chatClient = chatClientBuilder.build();
        this.vectorStore = vectorStore;
    }
    public ChatResponse chat(Long documentId, String question) {

        logger.info(
                "Chat request received for document ID: {}",
                documentId
        );
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

        //Send the retrieved context + question to the LLM
        try {
            String answer = chatClient
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
}
