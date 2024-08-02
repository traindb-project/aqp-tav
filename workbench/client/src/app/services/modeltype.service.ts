import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateModeltypeDto, Modeltype } from '../dto';

@Injectable({ providedIn: 'root' })
export class ModeltypeService {
  readonly loading = signal(false);
  private readonly httpClient = inject(HttpClient);
  private readonly BASE_URL = environment.apiHost + '/modeltypes';

  searchModeltypes(traindb_id: number) {
    const params = { traindb_id };
    this.loading.set(true);
    return this.httpClient.get<Modeltype[]>(this.BASE_URL, { params }).pipe(
      finalize(() => this.loading.set(false)),
    );
  }

  createModeltype(traindb_id: number, dto: CreateModeltypeDto) {
    const params = { traindb_id };
    this.loading.set(true);
    return this.httpClient.post<void>(this.BASE_URL, dto, { params });
  }

  deleteModeltype(traindb_id: number, name: string) {
    const params = { traindb_id };
    return this.httpClient.delete<void>(`${this.BASE_URL}/${name}`, { params });
  }
}
