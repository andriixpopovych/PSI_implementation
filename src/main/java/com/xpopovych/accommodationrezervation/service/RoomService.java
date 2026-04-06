package com.xpopovych.accommodationrezervation.service;

import com.xpopovych.accommodationrezervation.model.Room;
import com.xpopovych.accommodationrezervation.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;

    public Room findById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room with ID " + id + " not found"));
    }
}