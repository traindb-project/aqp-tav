import { Component, OnDestroy, OnInit, output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { distinctUntilChanged, map, Subscription } from 'rxjs';
import { MagnifyingGlassIconComponent } from '../../atoms';

@Component({
    selector: 'etri-search-input',
    styleUrls: ['search-input.component.scss'],
    templateUrl: 'search-input.component.html',
    imports: [
        FormsModule,
        MagnifyingGlassIconComponent,
        ReactiveFormsModule
    ]
})
export class SearchInputComponent implements OnInit, OnDestroy {
  onKeyword = output<string>();
  readonly keywordControl = new FormControl('');
  private readonly subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(
      this.keywordControl.valueChanges.pipe(
        map(keyword => (keyword || '').trim()),
        distinctUntilChanged()
      ).subscribe(keyword => this.onKeyword.emit(keyword))
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
