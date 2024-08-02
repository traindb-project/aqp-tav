import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { Model, TrainModel, UpdateModel } from '../dto';

@Injectable({ providedIn: 'root' })
export class ModelService {
  readonly loading = signal(false);
  private readonly httpClient = inject(HttpClient);
  private readonly BASE_URL = environment.apiHost + '/models';

  searchModels(traindb_id: number) {
    const params = { traindb_id };
    this.loading.set(true);
    return this.httpClient.get<Model[]>(this.BASE_URL, { params }).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  importModel(traindb_id: number, name: string, file: File) {
    const params = { traindb_id };
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient.post<void>(`${this.BASE_URL}/${name}/import`, formData, { params });
  }

  trainModel(dto: TrainModel) {
    return this.httpClient.post<void>(`${this.BASE_URL}/train`, dto);
  }

  updateModel(traindb_id: number, oldName: string, dto: UpdateModel) {
    const params = { traindb_id };
    return this.httpClient.put<void>(`${this.BASE_URL}/${oldName}`, dto, { params });
  }

  deleteModel(traindb_id: number, name: string) {
    const params = { traindb_id };
    return this.httpClient.delete<void>(`${this.BASE_URL}/${name}`, { params });
  }
}
