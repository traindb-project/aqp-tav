package kr.co.bimatrix.visualtool.repository;

import kr.co.bimatrix.visualtool.domain.AQP_GIS;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AqpGisRepository extends JpaRepository<AQP_GIS, Long> {
    List<AQP_GIS> findAll();
}
