package kr.co.bimatrix.visualtool.repository;

import kr.co.bimatrix.visualtool.domain.SQL_SIM;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SqlSimRepository extends JpaRepository<SQL_SIM, Long> {
    List<SQL_SIM> findAll();
}
