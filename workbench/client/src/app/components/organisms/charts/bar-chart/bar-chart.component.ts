import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  HostBinding,
  Input,
  input,
  OnDestroy,
  viewChild,
} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'etri-bar-chart',
  standalone: true,
  styleUrls: ['bar-chart.component.scss'],
  templateUrl: 'bar-chart.component.html',
})
export class BarChartComponent implements AfterViewInit, OnDestroy {
  readonly x = input<(string | number)[]>([]);
  readonly y = input<number[]>([]);
  readonly minY = input<number | null>(null);
  readonly maxY = input<number | null>(null);
  readonly xAxisLabel = input<string | null>(null);
  readonly yAxisLabel = input<string | null>(null);
  readonly title = input<string | null>(null);
  readonly chartRef = viewChild<ElementRef<HTMLDivElement>>('chartRef');
  readonly X = computed(() => {
    const x = this.x();
    return x.map((v, i) => {
      const count = x.slice(0, i).filter(val => val === v).length;
      return count > 0 ? `${v}_${count}` : String(v);
    });
  });
  @HostBinding('style.height') @Input() height = '500px';
  @HostBinding('style.width') @Input() width = '100%';

  private readonly MAX = 10;
  private readonly MIN = 0;
  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private tooltip!: d3.Selection<HTMLDivElement, unknown, null, undefined>;
  private resizeObserver: ResizeObserver;

  constructor() {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateChart();
    });

    effect(() => {
      const element = this.chartRef()?.nativeElement;
      if (element) this.resizeObserver.observe(element);
    });
  }

  ngAfterViewInit() {
    this.createChart();
  }

  ngOnDestroy() {
    const element = this.chartRef()?.nativeElement;
    if (element) this.resizeObserver.unobserve(element);
  }

  private createChart() {
    const element = this.chartRef()!.nativeElement;
    this.svg = d3.select(element).append('svg');
    this.tooltip = d3.select(element)
      .append('div')
      .style('position', 'absolute')
      .style('display', 'flex')
      .style('align-items', 'center')
      .style('justify-content', 'center')
      .style('text-align', 'center')
      .style('width', 'fit-content')
      .style('height', 'fit-content')
      .style('padding', '0.5rem')
      .style('border-radius', '0.5rem')
      .style('color', 'white')
      .style('background-color', 'rgba(0, 0, 0, 0.8)')
      .style('box-shadow', '2px 2px 2px rgba(0, 0, 0. 0.5)')
      .style('pointer-events', 'none')
      .style('opacity', 0);
    this.updateChart();
  }

  private updateChart() {
    if (!this.svg) return;
    const element = this.chartRef()!.nativeElement;
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const margin = { top: 60, right: 20, bottom: 70, left: 90 };

    this.svg
      .attr('width', width)
      .attr('height', height);

    const x = d3.scaleBand()
      .domain(this.X())
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([this.minY() ?? d3.min(this.y()) ?? this.MIN, this.maxY() ?? this.maxY() ?? d3.max(this.y()) ?? this.MAX])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const xAxis = (g: any) => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

    const yAxis = (g: any) => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    const xGrid = (g: any) => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x)
        .tickSize(-height + margin.top + margin.bottom)
        .tickFormat('' as any)
      )
      .call((g: any) => g.selectAll('.tick line')
        .attr('stroke', 'lightgrey')
        .attr('stroke-opacity', 0.7))
      .call((g: any) => g.select('.domain').remove());

    const yGrid = (g: any) => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y)
        .tickSize(-width + margin.left + margin.right)
        .tickFormat('' as any)
      )
      .call((g: any) => g.selectAll('.tick line')
        .attr('stroke', 'lightgrey')
        .attr('stroke-opacity', 0.7))
      .call((g: any) => g.select('.domain').remove());

    this.svg.selectAll('*').remove();

    // 그리드를 먼저 그립니다.
    this.svg.append('g').call(xGrid);
    this.svg.append('g').call(yGrid);

    // 컬러 스케일 정의
    const positiveColor = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, (d3.max(this.y().filter(d => d > 0)) ?? this.MAX) * 0.5]); // 양수 값 더 진하게

    const negativeColor = d3.scaleSequential(d3.interpolateReds)
      .domain([0, (d3.min(this.y().filter(d => d < 0)) ?? this.MIN) * 0.5]); // 음수 값 더 진하게

    this.svg.append('clipPath')
      .attr('id', 'chart-area')
      .append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom);

    this.svg.append('g')
      .attr('clip-path', 'url(#chart-area)') // 클리핑 적용
      .selectAll('rect')
      .data(this.y)
      .join('rect')
      .attr('x', (d, i) => x(this.X()[i])!)
      .attr('y', d => y(d))
      .attr('height', d => Math.abs(y(d) - y(0)))
      .attr('width', x.bandwidth())
      .attr('fill', d => d > 0 ? positiveColor(d) : negativeColor(d))
      .transition()
      .duration(800)
      .attr('y', d => y(Math.max(0, d)))
      .attr('height', d => Math.abs(y(d) - y(0)));

    this.svg.append('g').call(xAxis);

    if (this.xAxisLabel()) {
      this.svg.append('text')
        .attr('class', 'x label')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height - margin.bottom + 40) // x축 레이블 위치 조정
        .text(this.xAxisLabel());
    }

    this.svg.append('g').call(yAxis);

    if (this.yAxisLabel()) {
      this.svg.append('text')
        .attr('class', 'y label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', margin.left - 60) // y축 레이블 위치 조정
        .text(this.yAxisLabel());
    }

    if (this.title()) {
      this.svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .attr('class', 'chart-title text-lg font-bold')
        .text(this.title());
    }

    this.svg.selectAll('rect')
      .on('mouseover', (event, d: any) => {
        this.tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        this.tooltip.html(`x: ${this.X()[this.y().indexOf(d)]}<br/>y: ${d}`)
          .style('left', (event.offsetX + 10) + 'px')
          .style('top', (event.offsetY - 10) + 'px'); // 마우스 커서 근처에 툴팁 표시
      })
      .on('mouseout', () => {
        this.tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });
  }
}
