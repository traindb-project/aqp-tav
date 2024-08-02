import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { Column, Schema, TablePreviewRequest, TablePreviewResponse } from '../dto';

@Injectable({ providedIn: 'root' })
export class TableService {
  readonly loading = signal(false);
  private readonly httpClient = inject(HttpClient);
  private readonly BASE_URL = environment.apiHost + '/tables';

  searchTables(database_id: number) {
    this.loading.set(true);
    const params = { database_id };
    return this.httpClient.get<Schema[]>(this.BASE_URL, { params }).pipe(
      finalize(() => this.loading.set(false)),
    );
  }

  describeTable(database_id: number, schema_name: string, table_name: string) {
    const params = { database_id, schema_name };
    return this.httpClient.get<Column[]>(`${this.BASE_URL}/${table_name}`, { params });
  }

  previewTable(dto: TablePreviewRequest) {
    return this.httpClient.post<TablePreviewResponse>(`${this.BASE_URL}/preview`, dto);
  }
}
