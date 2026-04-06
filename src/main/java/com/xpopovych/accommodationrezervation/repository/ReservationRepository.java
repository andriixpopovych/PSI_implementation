package com.xpopovych.accommodationrezervation.repository;

import com.xpopovych.accommodationrezervation.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByRoomId(Long roomId);
    @Query("SELECT COUNT(r) > 0 FROM Reservation r " +
            "WHERE r.room.id = :roomId " +
            "AND r.checkInDate < :newOut " +
            "AND r.checkOutDate > :newIn")
    boolean existsOverlappingReservation(
            @Param("roomId") Long roomId,
            @Param("newIn") LocalDateTime newIn,
            @Param("newOut") LocalDateTime newOut
    );
}
