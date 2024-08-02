import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateQuery, FindQuery, RunQuery, UpdateQuery } from '../dto';

@Injectable({ providedIn: 'root' })
export class QueryService {
  readonly loading = signal(false);
  private readonly httpClient = inject((HttpClient));
  private readonly BASE_URL = environment.apiHost + '/queries';

  searchQueries(traindb_id: number) {
    const params: { [key: string]: number } = { traindb_id }
    return this.httpClient.get<FindQuery[]>(this.BASE_URL, { params }).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  findQuery(id: number) {
    return this.httpClient.get<FindQuery[]>(`${this.BASE_URL}/${id}`);
  }

  runQuery(id: number) {
    return this.httpClient.get<RunQuery>(`${this.BASE_URL}/${id}/run`);
  }

  createQuery(dto: CreateQuery) {
    return this.httpClient.post<void>(this.BASE_URL, dto);
  }

  updateQuery(id: number, dto: UpdateQuery) {
    return this.httpClient.put<void>(`${this.BASE_URL}/${id}`, dto);
  }

  deleteQuery(id: number) {
    return this.httpClient.delete<void>(`${this.BASE_URL}/${id}`);
  }
}
