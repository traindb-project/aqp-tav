package kr.co.bimatrix.visualtool.repository;

import kr.co.bimatrix.visualtool.domain.CMP_MES;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CmpMesRepository extends JpaRepository<CMP_MES, Long> {
    List<CMP_MES> findAll();
}
