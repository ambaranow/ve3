import { TestBed } from '@angular/core/testing';

import { VideoWorkService } from './video-work.service';

describe('VideoWorkService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VideoWorkService = TestBed.get(VideoWorkService);
    expect(service).toBeTruthy();
  });
});
