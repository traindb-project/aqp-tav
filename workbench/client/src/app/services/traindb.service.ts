import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { StorageKey } from '../constants';
import {
  CreateTrainDBDto,
  FindTrainDBDto,
  TestTrainDBConnectionRequestDto,
  TestTrainDBConnectionResponseDto,
  UpdateTrainDBDto
} from '../dto';

@Injectable({ providedIn: 'root' })
export class TraindbService {
  readonly current: WritableSignal<FindTrainDBDto | null> = signal<FindTrainDBDto | null>(null);
  readonly currentId: WritableSignal<number | null>;
  readonly loading: WritableSignal<boolean> = signal(false);
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly BASE_URL = environment.apiHost + '/traindbs';

  constructor() {
    const id = sessionStorage.getItem(StorageKey.CURRENT_TRAINDB);
    this.currentId = signal(id ? +id : null);
    setTimeout(() => this.subscribeCurrentTrainDB());
  }

  searchTrainDB() {
    this.loading.set(true);
    return this.httpClient.get<FindTrainDBDto[]>(this.BASE_URL).pipe(
      finalize(() => this.loading.set(false)),
    );
  }

  findTrainDB(id: number) {
    return this.httpClient.get<FindTrainDBDto>(`${this.BASE_URL}/${id}`);
  }

  createTrainDB(dto: CreateTrainDBDto) {
    return this.httpClient.post<void>(this.BASE_URL, dto);
  }

  updateTrainDB(id: number, dto: UpdateTrainDBDto) {
    return this.httpClient.put<void>(`${this.BASE_URL}/${id}`, dto);
  }

  deleteTrainDB(id: number) {
    return this.httpClient.delete<void>(`${this.BASE_URL}/${id}`);
  }

  testConnection(dto: TestTrainDBConnectionRequestDto) {
    return this.httpClient.post<TestTrainDBConnectionResponseDto>(`${this.BASE_URL}/test_connection`, dto);
  }

  private subscribeCurrentTrainDB() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
    ).subscribe({
      next: event => {
        if (!(event instanceof NavigationEnd)) return;
        if (/^(\/traindb|\/traindb\/.*)$/.test(event.url)) {
          this.currentId.set(null);
          sessionStorage.removeItem(StorageKey.CURRENT_TRAINDB);
        } else {
          const id = sessionStorage.getItem(StorageKey.CURRENT_TRAINDB);
          this.currentId.set(id ? +id : null);
          const traindbId = this.currentId();
          if (!traindbId) this.current.set(null);
          else this.findTrainDB(traindbId).subscribe({
            next: db => this.current.set(db),
            error: async err => {
              console.error(err);
              await this.router.navigate(['/traindb']);
            }
          });
        }
      }
    })
  }
}
