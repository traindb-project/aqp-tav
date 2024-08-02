import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateDatabase,
  FindDatabase,
  TestDatabaseConnectionRequest,
  TestTrainDBConnectionResponseDto,
  UpdateDatabase
} from '../dto';

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  readonly loading = signal(false);
  private readonly httpClient = inject(HttpClient);
  private readonly BASE_URL = environment.apiHost + '/databases';

  searchDatabases(traindb_id: number) {
    const params = { traindb_id };
    this.loading.set(true);
    return this.httpClient.get<FindDatabase[]>(this.BASE_URL, { params }).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  findDatabase(id: number) {
    return this.httpClient.get<FindDatabase>(`${this.BASE_URL}/${id}`);
  }

  createDatabase(dto: CreateDatabase) {
    return this.httpClient.post<void>(this.BASE_URL, dto);
  }

  testConnection(dto: TestDatabaseConnectionRequest) {
    return this.httpClient.post<TestTrainDBConnectionResponseDto>(`${this.BASE_URL}/test_connection`, dto);
  }

  updateDatabase(id: number, dto: UpdateDatabase) {
    return this.httpClient.put<void>(`${this.BASE_URL}/${id}`, dto);
  }

  deleteDatabase(id: number) {
    return this.httpClient.delete<void>(`${this.BASE_URL}/${id}`);
  }
}
