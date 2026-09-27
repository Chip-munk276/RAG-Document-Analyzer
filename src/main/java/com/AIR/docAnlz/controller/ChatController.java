package com.AIR.docAnlz.controller;

import com.AIR.docAnlz.dto.ChatRequest;
import com.AIR.docAnlz.dto.ChatResponse;
import com.AIR.docAnlz.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/documents")
public class ChatController {
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/{documentId}/chat")
    public ResponseEntity<ChatResponse> chat(
            @PathVariable Long documentId,
            @RequestBody ChatRequest request
    ) {

        return ResponseEntity.ok(
                chatService.chat(
                        documentId,
                        request.getQuestion()
                )
        );
    }
}
