package kr.co.bimatrix.visualtool.repository;

import kr.co.bimatrix.visualtool.domain.AQP_MES;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AqpMesRepository extends JpaRepository<AQP_MES, Long> {
    List<AQP_MES> findAll();
}
