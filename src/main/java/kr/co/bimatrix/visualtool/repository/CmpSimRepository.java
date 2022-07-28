package kr.co.bimatrix.visualtool.repository;

import kr.co.bimatrix.visualtool.domain.CMP_SIM;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CmpSimRepository extends JpaRepository<CMP_SIM, Long> {
    List<CMP_SIM> findAll();
}
