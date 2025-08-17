import { TestBed } from '@angular/core/testing';

import { BlobUploadService } from './blob-upload-service';

describe('BlobUploadService', () => {
  let service: BlobUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlobUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
