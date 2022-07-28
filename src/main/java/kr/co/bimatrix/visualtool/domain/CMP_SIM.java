package kr.co.bimatrix.visualtool.domain;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity(name = "CMP_SIM")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CMP_SIM {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
}
