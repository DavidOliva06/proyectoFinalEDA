import { TestBed } from '@angular/core/testing';

import { TreeService } from './tree.service';

describe('Tree', () => {
  let service: TreeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
