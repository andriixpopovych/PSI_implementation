package com.xpopovych.accommodationrezervation.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rooms")
@AllArgsConstructor
@NoArgsConstructor
@Getter @Setter
@Builder
public class Room {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;
    private String name;
    private int capacity;
    @Column(length = 1000)
    private String description;
    private String imageUrl;
}
