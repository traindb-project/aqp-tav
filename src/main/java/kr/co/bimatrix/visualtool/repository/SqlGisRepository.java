package kr.co.bimatrix.visualtool.repository;

import kr.co.bimatrix.visualtool.domain.SQL_GIS;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SqlGisRepository extends JpaRepository<SQL_GIS, Long> {
    List<SQL_GIS> findAll();
}
