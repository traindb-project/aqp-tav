import {
  AfterViewInit,
  Component, effect,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  input,
  OnDestroy,
  viewChild
} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'etri-line-chart',
  standalone: true,
  styleUrls: ['line-chart.component.scss'],
  templateUrl: 'line-chart.component.html',
})
export class LineChartComponent implements AfterViewInit, OnDestroy {
  x = input<(string | number)[]>([]);
  y = input<number[]>([]);
  minY = input<number | null>(null);
  maxY = input<number | null>(null);
  xAxisLabel = input<string | null>(null);
  yAxisLabel = input<string | null>(null);
  title = input<string | null>(null);
  chartRef = viewChild<ElementRef<HTMLDivElement>>('chartRef');
  @HostBinding('style.height') @Input() height = '500px';

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

    const x = d3.scaleLinear()
      .domain([0, this.x().length - 1])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([this.minY() ?? d3.min(this.y()) ?? this.MIN, this.maxY() ?? d3.max(this.y()) ?? this.MAX])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const xAxis = (g: any) => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(this.x().length - 1).tickFormat((i: any) => String(this.x()[i])));

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

    // 라인 생성
    const line = d3.line<any>()
      .x((d, i) => x(i))
      .y(d => y(d));

    this.svg.append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom)
      .attr('x', margin.left)
      .attr('y', margin.top);

    const path = this.svg.append('g')
      .attr('clip-path', 'url(#clip)')
      .append('path')
      .datum(this.y())
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('d', line);

    // 애니메이션 추가
    const totalLength = path.node()?.getTotalLength();
    if (totalLength) {
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(2000)
        .attr('stroke-dashoffset', 0);
    }

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

    this.svg.append('g')
      .attr('clip-path', 'url(#clip)')
      .selectAll('circle')
      .data(this.y())
      .enter()
      .append('circle')
      .attr('cx', (d, i) => x(i))
      .attr('cy', d => y(d))
      .attr('r', 3)
      .attr('fill', 'steelblue')
      .on('mouseover', (event, d: any) => {
        d3.select(event.currentTarget)
          .attr('fill', 'orange')
          .attr('r', 5);
        this.tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        this.tooltip.html(`x: ${this.x()[this.y().indexOf(d)]}<br/>y: ${d}`)
          .style('left', (event.offsetX + 10) + 'px')
          .style('top', (event.offsetY - 10) + 'px'); // 마우스 커서 근처에 툴팁 표시
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget)
          .attr('fill', 'steelblue')
          .attr('r', 3);
        this.tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });
  }
}
