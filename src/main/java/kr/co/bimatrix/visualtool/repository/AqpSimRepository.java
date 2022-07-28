package kr.co.bimatrix.visualtool.repository;

import kr.co.bimatrix.visualtool.domain.AQP_SIM;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AqpSimRepository extends JpaRepository<AQP_SIM, Long> {
    List<AQP_SIM> findAll();
}
