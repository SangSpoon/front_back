package com.smhrd.sangspoon.site.repository;

import com.smhrd.sangspoon.site.entity.SiteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SiteRepository extends JpaRepository<SiteEntity, Long> {
}
