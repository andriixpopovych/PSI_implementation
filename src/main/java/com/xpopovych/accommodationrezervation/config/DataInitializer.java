package com.xpopovych.accommodationrezervation.config;

import com.xpopovych.accommodationrezervation.model.*;
import com.xpopovych.accommodationrezervation.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    @Override
    public void run(String... args) {
        log.info("--- Starting Mock Data Initializer ---");

        User testUser = User.builder()
                .firstName("Ivan")
                .lastName("Gonar")
                .email("ivan.p@example.com")
                .role(Role.USER)
                .build();
        userRepository.save(testUser);
        log.info("Test User created: ID = {}", testUser.getId());

        Room r1 = Room.builder()
                .name("Standard Single Room")
                .capacity(1)
                .description("Cozy and compact room perfect for solo travelers. City view.")
                .imageUrl("https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=600")
                .build();

        Room r2 = Room.builder()
                .name("Comfort Double Room")
                .capacity(2)
                .description("Spacious room with a queen-size bed, sofa, and modern amenities.")
                .imageUrl("https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600")
                .build();

        Room r3 = Room.builder()
                .name("Family Suite")
                .capacity(4)
                .description("Large suite featuring two bedrooms, a living area, and a kitchenette.")
                .imageUrl("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600")
                .build();

        Room r4 = Room.builder()
                .name("Presidential Luxury Suite")
                .capacity(2)
                .description("Top-floor suite with a panoramic view, private terrace, and a jacuzzi.")
                .imageUrl("https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=600")
                .build();

        roomRepository.saveAll(Arrays.asList(r1, r2, r3, r4));

        log.info("--- 4 Mock Rooms Loaded Successfully ---");
    }
}