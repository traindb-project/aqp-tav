package kr.co.bimatrix.visualtool.repository;

import kr.co.bimatrix.visualtool.domain.SQL_GIS;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class SqlGisRepositoryTest {
    @Autowired
    SqlGisRepository sqlGisRepository;

    @Test
    public void 테스트다요() {
        SQL_GIS SQLGis = SQL_GIS.builder()
                .humidity(10L)
                .build();

        SQL_GIS SQLGis2 = SQL_GIS.builder()
                .humidity(20L)
                .build();

        List<SQL_GIS> before = sqlGisRepository.findAll();
        sqlGisRepository.save(SQLGis);
        sqlGisRepository.save(SQLGis2);
        List<SQL_GIS> after = sqlGisRepository.findAll();

        System.out.println("how many is it in before? " + before.size());
        System.out.println("how many is it in after? " + after.size());
        assertThat(before.size() + 2).isEqualTo(after.size());


    }
}