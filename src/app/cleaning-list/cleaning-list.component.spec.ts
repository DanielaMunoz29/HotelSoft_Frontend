import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CleaningListComponent } from './cleaning-list.component';

describe('CleaningListComponent', () => {
  let component: CleaningListComponent;
  let fixture: ComponentFixture<CleaningListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CleaningListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CleaningListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
