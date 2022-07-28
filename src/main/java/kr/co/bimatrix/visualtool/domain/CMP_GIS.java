package kr.co.bimatrix.visualtool.domain;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.sql.Date;

@Entity(name = "CMP_GIS")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CMP_GIS {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private Date date;

    @Column
    private Long time_code;

    @Column
    private Long zip_code;

    @Column
    private Long business_category_code;

    @Column
    private Long commercial_area_code;

    @Column
    private Long sales_count;

    @Column
    private Long sales_amount;

    @Column
    private Long temperature;

    @Column
    private Long humidity;

    @Column
    private Long precipitation;

    @Column
    private Long wind_direction;

    @Column
    private Long wind_speed;

    @Column
    private Long floating_population;

    @Builder
    public CMP_GIS(Date date, Long time_code, Long zip_code, Long business_category_code, Long commercial_area_code, Long sales_count, Long sales_amount, Long temperature, Long humidity, Long precipitation, Long wind_direction, Long wind_speed, Long floating_population) {
        this.date = date;
        this.time_code = time_code;
        this.zip_code = zip_code;
        this.business_category_code = business_category_code;
        this.commercial_area_code = commercial_area_code;
        this.sales_count = sales_count;
        this.sales_amount = sales_amount;
        this.temperature = temperature;
        this.humidity = humidity;
        this.precipitation = precipitation;
        this.wind_direction = wind_direction;
        this.wind_speed = wind_speed;
        this.floating_population = floating_population;
    }
}
