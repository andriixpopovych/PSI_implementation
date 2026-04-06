package com.xpopovych.accommodationrezervation.repository;

import com.xpopovych.accommodationrezervation.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {}
