import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateSynopsis, Synopsis, UpdateSynopsis } from '../dto';

@Injectable({ providedIn: 'root' })
export class SynopsisService {
  readonly loading = signal(false);
  private readonly httpClient = inject(HttpClient);
  private readonly BASE_URL = environment.apiHost + '/synopses';

  searchSynopses(traindb_id: number) {
    const params = { traindb_id };
    this.loading.set(true);
    return this.httpClient.get<Synopsis[]>(this.BASE_URL, { params }).pipe(
      finalize(() => this.loading.set(false)),
    );
  }

  createSynopsis(database_id: number, dto: CreateSynopsis) {
    const params = { database_id };
    return this.httpClient.post<void>(this.BASE_URL, dto, { params });
  }

  updateSynopsis(traindb_id: number, name: string, dto: UpdateSynopsis) {
    const params = { traindb_id };
    return this.httpClient.put<void>(`${this.BASE_URL}/${name}`, dto, { params });
  }

  deleteSynopsis(traindb_id: number, name: string) {
    const params = { traindb_id };
    return this.httpClient.delete<void>(`${this.BASE_URL}/${name}`, { params });
  }
}
