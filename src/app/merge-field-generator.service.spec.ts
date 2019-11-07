import { TestBed } from '@angular/core/testing';

import { MergeFieldGeneratorService } from './merge-field-generator.service';

describe('MergeFieldGeneratorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MergeFieldGeneratorService = TestBed.get(MergeFieldGeneratorService);
    expect(service).toBeTruthy();
  });
});
