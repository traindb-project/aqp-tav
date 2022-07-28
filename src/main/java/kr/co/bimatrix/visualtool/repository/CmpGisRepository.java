package kr.co.bimatrix.visualtool.repository;

import kr.co.bimatrix.visualtool.domain.CMP_GIS;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CmpGisRepository extends JpaRepository<CMP_GIS, Long> {
    List<CMP_GIS> findAll();
}
