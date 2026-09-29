package com.AIR.docAnlz.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChatResponse {

    private Long documentId;
    private String question;
    private String answer;
}
