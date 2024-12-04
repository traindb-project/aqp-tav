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
  standalone: true,
  selector: 'etri-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements AfterViewInit, OnDestroy {
  readonly x = input<(string | number)[]>([]);
  readonly y = input<number[]>([]);
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
    const element = this.chartRef()!.nativeElement;
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const margin = 50;
    const radius = Math.min(width, height) / 2 - margin;

    // 기존 SVG 내용을 지웁니다
    this.svg.selectAll('*').remove();

    const g = this.svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(this.y()) ?? this.MAX]);

    const pie = d3.pie<number>()
      .value((d: number) => d)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const arcOver = d3.arc()
      .innerRadius(0)
      .outerRadius(radius + 10);

    const pieData = pie(this.y());

    // 파이 조각 그리기
    const path = g.selectAll('path')
      .data(pieData)
      .enter()
      .append('path')
      .attr('d', arc as any)
      .attr('fill', (d) => colorScale(d.data))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .each(function (d) {
        (this as any)._current = d;
      });

    // 마우스 이벤트 추가
    path.on('mouseover', (event, d) => {
      const percentage = ((d.data / d3.sum(this.y())) * 100).toFixed(2);
      this.tooltip
        .style('opacity', 1)
        .html(`${this.X()[d.index]}: ${d.data} (${percentage}%)`)
        .style('left', (event.offsetX + 10) + 'px')
        .style('top', (event.offsetY - 10) + 'px'); // 마우스 커서 근처에 툴팁 표시
      d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr('d', arcOver as any);
    })
      .on('mouseout', (event) => {
        this.tooltip
          .style('opacity', 0);
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('d', arc as any);
      });

    // 레이블 추가
    const labelArc = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.6);

    // 레이블 배경 추가
    g.selectAll('.label-background')
      .data(pieData)
      .enter()
      .append('rect')
      .attr('class', 'label-background')
      .attr('transform', (d: any) => `translate(${labelArc.centroid(d)})`)
      .attr('x', -30) // 배경 너비의 절반
      .attr('y', -10) // 배경 높이의 절반
      .attr('width', 60) // 배경 너비
      .attr('height', 20) // 배경 높이
      .attr('fill', 'rgba(255, 255, 255, 0.8)') // 반투명한 흰색 배경
      .style('opacity', 0)
      .transition()
      .delay((d, i) => i * 500 + 500)
      .style('opacity', 1);

    g.selectAll('.label')
      .data(pieData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .text((d, i) => this.X()[i])
      .attr('transform', (d: any) => `translate(${labelArc.centroid(d)})`)
      .attr('dy', '0.35em')
      .style('text-anchor', 'middle')
      .style('font-size', '15px')
      .style('fill', 'black') // 텍스트 색상을 검정색으로 변경
      .style('font-weight', 'bold')
      .style('opacity', 0)
      .transition()
      .delay((d, i) => i * 500 + 500)
      .style('opacity', 1);

    // 제목 추가
    g.append('text')
      .attr('x', 0)
      .attr('y', -height / 2 + margin / 2)
      .attr('text-anchor', 'middle')
      .attr('class', 'chart-title text-lg font-bold')
      .style('font-size', '24px')
      .style('text-decoration', 'underline')
      .text(this.title());
  }
}
