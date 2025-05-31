package com.nowakartur97.battleshipgame.game;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import static com.nowakartur97.battleshipgame.game.WebSocketConfig.WEB_SOCKET_PATH;

@Component
@RequiredArgsConstructor
@Slf4j
public class GameWebSocketHandler extends TextWebSocketHandler {

    private final Map<String, Set<WebSocketSession>> games = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(final WebSocketSession session) {
        final String gameId = getGameId(session);
        log.info("Connection established for game: {}", gameId);
        games.computeIfAbsent(gameId, game -> ConcurrentHashMap.newKeySet()).add(session);
    }

    @Override
    public void afterConnectionClosed(final WebSocketSession session, final CloseStatus status) {
        final String gameId = getGameId(session);
        final Set<WebSocketSession> sessions = games.get(gameId);
        sessions.remove(session);
        log.info("Session closed for game: {}", gameId);
        if (sessions.isEmpty()) {
            games.remove(gameId);
        }
    }

    @Override
    protected void handleTextMessage(final WebSocketSession session, final TextMessage message) throws Exception {
        final String gameId = getGameId(session);
        final Set<WebSocketSession> sessions = games.get(gameId);
        for (final WebSocketSession s : sessions) {
            if (s.isOpen()) {
                final String payload = message.getPayload();
                log.info("Received message {} for game: {}", payload, gameId);
                synchronized (s) {
                    s.sendMessage(new TextMessage(payload));
                }
            }
        }
    }

    private String getGameId(final WebSocketSession session) {
        return session.getUri().getPath().split(WEB_SOCKET_PATH)[1];
    }
}
