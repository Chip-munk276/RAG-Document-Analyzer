package com.AIR.docAnlz.service;

//import com.AIR.docAnlz.dto.ChatRequest;
import com.AIR.docAnlz.dto.ChatResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class ChatService {
    private final ChatClient chatClient;

    public ChatService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    public ChatResponse chat(Long documentId, String question) {

        String answer = chatClient
                .prompt()
                .user(question)
                .call()
                .content();

        return new ChatResponse(answer);
    }
}
