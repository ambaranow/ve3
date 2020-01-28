import { TestBed } from '@angular/core/testing';

import { VideoPlayerService } from './video-player.service';

describe('VideoPlayerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VideoPlayerService = TestBed.get(VideoPlayerService);
    expect(service).toBeTruthy();
  });
});
