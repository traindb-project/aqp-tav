package kr.co.bimatrix.visualtool.repository;

import kr.co.bimatrix.visualtool.domain.SQL_MES;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SqlMesRepository extends JpaRepository<SQL_MES, Long> {
    List<SQL_MES> findAll();
}