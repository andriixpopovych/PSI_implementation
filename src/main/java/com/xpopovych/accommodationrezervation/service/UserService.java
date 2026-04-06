package com.xpopovych.accommodationrezervation.service;

import com.xpopovych.accommodationrezervation.model.User;
import com.xpopovych.accommodationrezervation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User with ID " + id + " not found"));
    }
}