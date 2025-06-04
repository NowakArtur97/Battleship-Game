package com.nowakartur97.battleshipgame.game;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class GameController {

    private final GameWebSocketHandler gameWebSocketHandler;

    @GetMapping("/game/{gameId}")
    public ResponseEntity<Void> getGame(@PathVariable final String gameId) {
        return gameWebSocketHandler.getGames().get(gameId) != null
                ? ResponseEntity.ok().build()
                : ResponseEntity.notFound().build();
    }
}
