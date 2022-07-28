package kr.co.bimatrix.visualtool.domain;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity(name = "SQL_MES")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SQL_MES {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
}
