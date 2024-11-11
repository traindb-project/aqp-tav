import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateDashboard, FindDashboard, UpdateDashboard } from '../dto';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  loading = signal(false);
  private readonly httpClient = inject(HttpClient);
  private readonly BASE_URL = environment.apiHost + '/dashboard';

  searchDashboard(traindb_id: number) {
    const params = { traindb_id };
    this.loading.set(true);
    return this.httpClient.get<FindDashboard[]>(this.BASE_URL, { params }).pipe(
      finalize(() => this.loading.set(false)),
    )
  }

  createDashboard(dto: CreateDashboard) {
    return this.httpClient.post<void>(this.BASE_URL, dto);
  }

  updateDashboard(id: number, dto: UpdateDashboard) {
    return this.httpClient.put<void>(`${this.BASE_URL}/${id}`, dto);
  }

  deleteDashboard(id: number) {
    return this.httpClient.delete<void>(`${this.BASE_URL}/${id}`);
  }
}
