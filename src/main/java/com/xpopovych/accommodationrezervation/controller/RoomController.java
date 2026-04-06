package com.xpopovych.accommodationrezervation.controller;

import com.xpopovych.accommodationrezervation.model.Room;
import com.xpopovych.accommodationrezervation.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomRepository roomRepository;

    @GetMapping("/all")
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }
}