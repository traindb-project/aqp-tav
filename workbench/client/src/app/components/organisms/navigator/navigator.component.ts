import { NgComponentOutlet, NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ChartBarIconComponent,
  ChevronLeftIconComponent,
  CircleStackIconComponent,
  CommandLineIconComponent,
  ComputerDesktopIconComponent,
  CubeIconComponent,
  RectangleGroupIconComponent,
  Square3Stack3dIconComponent
} from '../../atoms';

@Component({
  imports: [
    RouterLink,
    NgOptimizedImage,
    NgComponentOutlet,
    ChevronLeftIconComponent
  ],
  selector: 'etri-navigator',
  standalone: true,
  styleUrls: ['navigator.component.scss'],
  templateUrl: 'navigator.component.html'
})
export class NavigatorComponent {
  readonly route = inject(ActivatedRoute);

  iconInputs = {
    class: 'size-10',
    type: 'solid',
  };

  menuItems = [
    {
      icon: ComputerDesktopIconComponent,
      name: 'Dashboard',
      link: '/dashboard',
    },
    {
      icon: ChartBarIconComponent,
      name: 'Benchmarks',
      link: '/benchmarks',
    },
    // {
    //   icon: RectangleStackIconComponent,
    //   name: 'TrainDB',
    //   link: '/traindb',
    // },
    {
      icon: RectangleGroupIconComponent,
      name: 'Model Types',
      link: '/modeltypes'
    },
    {
      icon: CircleStackIconComponent,
      name: 'Databases',
      link: '/databases',
    },
    {
      icon: CubeIconComponent,
      name: 'Models',
      link: '/models'
    },
    {
      icon: Square3Stack3dIconComponent,
      name: 'Synopses',
      link: '/synopses'
    },
    {
      icon: CommandLineIconComponent,
      name: 'Queries',
      link: '/queries'
    }
  ];

  private readonly router = inject(Router);

  isActive(link: string) {
    return this.router.url.startsWith(link);
  }
}
