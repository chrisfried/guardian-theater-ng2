import { animate, style, transition, trigger } from '@angular/animations';
import {
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription, combineLatest as observableCombineLatest } from 'rxjs';
import { gt } from '../gt.typings';
import { ActivityService } from '../services/activity.service';
import { GuardianService } from '../services/guardian.service';
import { SettingsService } from '../services/settings.service';
import { Instance, Video, GtApiService } from 'app/services/gtApi.service';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  providers: [ActivityService, GuardianService],
  animations: [
    trigger('growInShrinkOut', [
      transition('void => *', [
        style({ height: 0 }),
        animate('600ms ease-out', style({ height: '*' }))
      ]),
      transition('* => void', [
        style({ height: '*' }),
        animate('300ms ease-in', style({ height: 0 }))
      ])
    ])
  ]
})
export class ActivityComponent implements OnInit, OnDestroy {
  @Input() instance: Instance;

  private subs: Subscription[];

  public pgcr: gt.PostGameCarnageReport;
  public clips: gt.Clip[];
  public filteredClips: gt.Clip[];
  public links: gt.Links;
  public mini: boolean;
  public animationState;
  public innerWidth: number;
  public instanceId: string;
  public loadingInstance: boolean;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    window.innerWidth < 640 ? (this.mini = true) : (this.mini = false);
  }

  constructor(
    private router: Router,
    public settingsService: SettingsService,
    public sanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private gtApiService: GtApiService
  ) {}

  ngOnInit() {
    this.subs = [];
    this.subs.push(
      this.activatedRoute.params.subscribe((params: Params) => {
        this.instanceId = params['activityId'] ? params['activityId'] : '';

        if (this.instanceId) {
          this.loadingInstance = true;

          this.subs.push(
            this.gtApiService.getInstance(this.instanceId).subscribe(res => {
              this.instance = res;

              this.instance.videos.forEach(video => {
                if (
                  video.type === 'xbox' &&
                  video.embedUrl.indexOf('xboxrecord.us') > -1
                ) {
                  const fetchEmbedUrl = video.embedUrl;
                  video.embedUrl = '';
                  this.subs.push(
                    this.http.get(fetchEmbedUrl).subscribe((resp: any) => {
                      try {
                        video.embedUrl = resp.gameClips[0].gameClipUris[0].uri;
                      } catch (e) {}
                    })
                  );
                }
              });
              this.loadingInstance = false;
            })
          );
        }
      })
    );

    window.innerWidth < 640 ? (this.mini = true) : (this.mini = false);
    this.filteredClips = [];
    this.clips = [];
    this.links = { guardian: {}, activity: {}, xbox: {} };
    this.animationState = 'in';

    this.subs.push(
      this.settingsService.links.subscribe(links => (this.links = links))
    );

    if (this.instance) {
      this.instance.videos.forEach(video => {
        if (
          video.type === 'xbox' &&
          video.embedUrl.indexOf('xboxrecord.us') > -1
        ) {
          const fetchEmbedUrl = video.embedUrl;
          video.embedUrl = '';
          this.subs.push(
            this.http.get(fetchEmbedUrl).subscribe((res: any) => {
              try {
                video.embedUrl = res.gameClips[0].gameClipUris[0].uri;
              } catch (e) {}
            })
          );
        }
      });
    }
  }

  ngOnDestroy() {
    this.animationState = '';
    this.subs.forEach(sub => sub.unsubscribe());
  }

  toActivity(activityId) {
    this.router.navigate(['/activity', activityId]);
  }

  toGuardian(membershipType, membershipId) {
    this.router.navigate(['/guardian', membershipType, membershipId]);
  }

  toClip(pgcr: gt.PostGameCarnageReport, clip) {
    this.router.navigate([
      '/activity',
      clip.entry.player.destinyUserInfo.membershipType,
      pgcr.activityDetails.instanceId,
      clip.entry.characterId,
      clip.video.gameClipId
    ]);
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  route(route: any[]) {
    this.router.navigate(route);
  }
}

@Component({
  selector: 'app-pgcr-entry',
  templateUrl: './pgcr-entry.component.html',
  styleUrls: ['./activity.component.scss']
})
export class PgcrEntryComponent {
  // @Input() pgcr: gt.PostGameCarnageReport;
  @Input() instance: Instance;
  // @Input() entry: gt.Entry;
  @Input() entry: Video;
  @Input() links: gt.Links;

  constructor(private router: Router) {}

  toGuardian(membershipType, membershipId) {
    this.router.navigate(['/guardian', membershipType, membershipId]);
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  route(route: any[]) {
    this.router.navigate(route);
  }
}
