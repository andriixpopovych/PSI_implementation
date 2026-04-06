package com.xpopovych.accommodationrezervation.controller;

import com.xpopovych.accommodationrezervation.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping("/check-availability")
    public boolean checkAvailability(
            @RequestParam Long roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        return reservationService.isRoomAvailable(roomId, start, end);
    }

    @PostMapping("/create")
    public String createReservation(
            @RequestParam Long userId,
            @RequestParam Long roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime checkOut) {

        if (!reservationService.isRoomAvailable(roomId, checkIn, checkOut)) {
            return "Room is not available (4a).";
        }

        reservationService.createReservation(userId, roomId, checkIn, checkOut);

        return "Reservation was successfully created!";
    }
}