package com.xpopovych.accommodationrezervation.service;

import com.xpopovych.accommodationrezervation.model.Reservation;
import com.xpopovych.accommodationrezervation.model.Room;
import com.xpopovych.accommodationrezervation.model.User;
import com.xpopovych.accommodationrezervation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserService userService;
    private final RoomService roomService;

    public void createReservation(Long userId, Long roomId, LocalDateTime checkIn, LocalDateTime checkOut) {

        if (!isRoomAvailable(roomId, checkIn, checkOut)) {
            throw new RuntimeException("Room is not available for the selected dates.");
        }

        User user = userService.findById(userId);
        Room room = roomService.findById(roomId);

        Reservation reservation = Reservation.builder()
                .user(user)
                .room(room)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .reservationDate(LocalDateTime.now())
                .build();

        reservationRepository.save(reservation);
    }

    public boolean isRoomAvailable(Long roomId, LocalDateTime checkIn, LocalDateTime checkOut) {
        return !reservationRepository.existsOverlappingReservation(roomId, checkIn, checkOut);
    }
}