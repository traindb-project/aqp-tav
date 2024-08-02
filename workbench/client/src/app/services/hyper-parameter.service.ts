import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { HyperParameter } from '../dto';

@Injectable({ providedIn: 'root' })
export class HyperParameterService {
  readonly loading = signal(false);
  private readonly httpClient = inject(HttpClient);
  private readonly BASE_URL = environment.apiHost + '/hyperparameters';

  searchHyperParameters(traindb_id: number) {
    const params = { traindb_id };
    this.loading.set(true);
    return this.httpClient.get<HyperParameter[]>(this.BASE_URL, { params }).pipe(
      finalize(() => this.loading.set(false))
    );
  }
}
