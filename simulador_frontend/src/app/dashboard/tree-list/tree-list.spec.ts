import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeListComponent } from './tree-list.component';

describe('TreeList', () => {
  let component: TreeListComponent;
  let fixture: ComponentFixture<TreeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
