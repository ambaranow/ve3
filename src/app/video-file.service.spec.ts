import { TestBed } from '@angular/core/testing';

import { VideoFileService } from './video-file.service';

describe('VideoFileService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VideoFileService = TestBed.get(VideoFileService);
    expect(service).toBeTruthy();
  });
});
