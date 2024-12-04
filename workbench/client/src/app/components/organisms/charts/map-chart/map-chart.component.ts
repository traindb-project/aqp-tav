import { AfterViewInit, Component, computed, effect, ElementRef, HostBinding, inject, Injector, Input, input, signal, viewChild } from '@angular/core';
import { wktToGeoJSON } from '@terraformer/wkt';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import { fromLonLat } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import proj4 from 'proj4';
import { Style, Stroke, Fill, Text } from 'ol/style';
import { Overlay } from 'ol';

proj4.defs("EPSG:5179", "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs");

@Component({
  standalone: true,
  selector: 'etri-map-chart',
  styleUrls: ['map-chart.component.scss'],
  templateUrl: 'map-chart.component.html',
})
export class MapChartComponent implements AfterViewInit {
  readonly x = input<(string | number)[]>([]); // label
  readonly y = input<number[]>([]);            // count
  readonly wkt = input<string[]>([]);          // wkt
  readonly title = input<string | null>(null);

  readonly trimedX = computed(() => this.x().map(v => typeof v === 'string' ? v.trim() : v));
  readonly geometry = computed(() => this.wkt().map(wkt => {
    const geometry = wktToGeoJSON(wkt) as any;
    const transformCoordinates = (coords: number[][]) => {
      return coords.map(coord => {
        const [x, y] = coord;
        const transformed = proj4('EPSG:5179', 'EPSG:4326', [x, y]);
        return transformed;
      });
    };

    if (Array.isArray(geometry.coordinates[0][0][0])) {
      geometry.type = 'MultiPolygon';
      geometry.coordinates = geometry.coordinates.map((polygon: number[][][]) =>
        polygon.map((ring: number[][]) => transformCoordinates(ring))
      );
    } else {
      geometry.coordinates = geometry.coordinates.map((ring: number[][]) =>
        transformCoordinates(ring)
      );
    }
    return geometry;
  }));
  readonly geoJson = computed(() => {
    return {
      type: 'FeatureCollection',
      features: this.geometry().map((geometry, index) => ({
        type: 'Feature',
        geometry,
        properties: {
          label: this.trimedX()[index] ?? '',
          value: this.y()[index] ?? null,
        },
      })),
    };
  });

  @Input() height = '500px';

  readonly mapRef = viewChild<ElementRef<HTMLDivElement>>('mapRef');
  readonly map = signal<Map | null>(null);

  private readonly vectorSource = new VectorSource();
  private readonly vectorLayer = new VectorLayer({ source: this.vectorSource });
  private readonly injector = inject(Injector);

  ngAfterViewInit() {
    const target = this.mapRef()?.nativeElement;
    if (target) {
      this.map.set(new Map({
        target,
        layers: [this.vectorLayer],
        view: new View({
          center: fromLonLat([127.7646949, 36.358949]), // Center the map based on your data
          zoom: 8,
          maxZoom: 18,
        }),
      }));
      this.init();
    }
  }

  private init() {
    effect(() => {
      const geoJson = this.geoJson();
      if (geoJson.features.length > 0) {
        // 모든 value 값 추출
        const values = geoJson.features.map(feature => feature.properties.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);

        // 모든 좌표 추출
        const coordinates = geoJson.features.flatMap(feature => {
          if (feature.geometry.type === 'MultiPolygon') {
            return feature.geometry.coordinates.flat(2);
          }
          return feature.geometry.coordinates.flat(1);
        });

        // 위경도의 평균값 계산
        const centerLon = coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length;
        const centerLat = coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length;

        // 지도 뷰 업데이트
        const view = this.map()?.getView();
        view?.setCenter(fromLonLat([centerLon, centerLat]));

        // 위경도 범위에 따른 zoom level 조정
        const lonExtent = coordinates.reduce((extent, coord) => {
          return {
            min: Math.min(extent.min, coord[0]),
            max: Math.max(extent.max, coord[0])
          };
        }, { min: Infinity, max: -Infinity });

        const latExtent = coordinates.reduce((extent, coord) => {
          return {
            min: Math.min(extent.min, coord[1]),
            max: Math.max(extent.max, coord[1])
          };
        }, { min: Infinity, max: -Infinity });

        const lonDiff = lonExtent.max - lonExtent.min;
        const latDiff = latExtent.max - latExtent.min;
        const maxDiff = Math.max(lonDiff, latDiff);

        // 위경도 차이가 클수록 더 멀리서 보기 위해 zoom level 낮춤
        let zoom = 12;
        if (maxDiff > 2) {
          zoom = 7;
        } else if (maxDiff > 1) {
          zoom = 8;
        } else if (maxDiff > 0.5) {
          zoom = 9;
        } else if (maxDiff > 0.2) {
          zoom = 10;
        }
        view?.setZoom(zoom);

        // 값의 범위를 10단계로 나누기
        const step = (maxValue - minValue) / 10;

        // 색상 단계 생성 함수
        const getColorForValue = (value: number) => {
          // 0~9 사이의 인덱스 계산
          const index = Math.min(9, Math.floor((value - minValue) / step));
          // 파란색 계열의 색상 농도 계산 (0.1 ~ 1.0)
          const opacity = minValue === maxValue ? 0.1 : (index + 1) / 10;
          return `rgba(0, 0, 255, ${opacity})`;
        };

        const format = new GeoJSON({
          featureProjection: 'EPSG:3857'
        });
        const features = format.readFeatures(geoJson);
        this.vectorSource.addFeatures(features);

        this.vectorLayer.setStyle((feature, resolution) => {
          const label = feature.get('label');
          const value = feature.get('value');
          // data.json에서 admCd가 일치하고 population이 50000 이상인 경우 빨간색 채우기 (투명도 0.7)
          // value 값에 따라 색상 적용

          // 마우스 호버 시 팝업 표시를 위한 오버레이 생성
          if (!this.map()?.getOverlayById('popup')) {
            const popupElement = document.createElement('div');
            popupElement.className = 'ol-popup';
            popupElement.style.cssText = `
              position: absolute;
              background-color: rgba(0, 0, 0, 0.5);
              color: white;
              padding: 10px;
              border-radius: 4px;
              border: 1px solid #cccccc;
              bottom: 12px;
              left: -50px;
              min-width: 100px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            `;

            const overlay = new Overlay({
              id: 'popup',
              element: popupElement,
              positioning: 'bottom-center',
              stopEvent: false,
              offset: [0, -10]
            });

            this.map()?.addOverlay(overlay);

            // 마우스 이벤트 핸들러 등록
            this.map()?.on('pointermove', (evt) => {
              const feature = this.map()?.forEachFeatureAtPixel(evt.pixel, (feature) => feature);

              if (feature) {
                const label = feature.get('label');
                const value = feature.get('value');

                popupElement.innerHTML = `${label}: ${value}`;
                overlay.setPosition(evt.coordinate);
                popupElement.style.display = 'block';
              } else {
                popupElement.style.display = 'none';
              }
            });
          }

          const color = getColorForValue(value);
          return new Style({
            stroke: new Stroke({
              color: '#000000',
              width: 1
            }),
            fill: new Fill({
              color: color
            }),
            text: new Text({
              text: `${label}${value ? '(' + value.toLocaleString() + ')' : ''}`,
              textAlign: 'center',
              font: '12px roboto, sans-serif',
              fill: new Fill({
                color: '#000000'
              })
            })
          });
        });
      }
    }, { injector: this.injector, allowSignalWrites: true });
  }
}
