import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { LoadingComponent } from '../../../../components';
import { ModeltypeService, TraindbService } from '../../../../services';

@Component({
    selector: 'etri-modeltype-form-page',
    styleUrls: ['modeltype-form-page.component.scss'],
    templateUrl: 'modeltype-form-page.component.html',
    imports: [
        FormsModule,
        LoadingComponent,
        RouterLink,
        ReactiveFormsModule
    ]
})
export class ModeltypeFormPageComponent implements OnInit, OnDestroy {
  loading = false;
  conflictName = false;
  readonly formGroup: FormGroup;
  private readonly traindbService = inject(TraindbService);
  private readonly modeltypeService = inject(ModeltypeService);
  private readonly router = inject(Router);
  private readonly subscription = new Subscription();

  constructor(formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({
      name: [null, [Validators.required]],
      category: [null, [Validators.required]],
      location: [null, [Validators.required]],
      className: [null, [Validators.required]],
      uri: [null, [Validators.required]]
    });
  }

  submit() {
    const dto = this.formGroup.getRawValue();
    const traindbId = this.traindbService.currentId();
    if (!traindbId) return;
    this.loading = true;
    this.modeltypeService.createModeltype(traindbId, dto).pipe(
      finalize(() => this.loading = false),
    ).subscribe({
      next: () => this.router.navigate(['/modeltypes']),
      error: err => {
        console.error(err);
        if (err.status === 409) {
          this.conflictName = true;
          alert('이미 사용 중인 모델 타입명입니다.');
          return;
        }
        alert(`Error: ${err.error?.detail ?? err.message}`);
      }
    })
  }

  ngOnInit() {
    this.subscription.add(
      this.formGroup.valueChanges.subscribe(() => this.conflictName = false)
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
