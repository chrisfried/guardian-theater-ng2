import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'angular-2-local-storage';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {
  public searchString: string;
  public ad: boolean;
  private adInterval;
  private adTimeout;
  public betaTextHidden: {
    hidden?: boolean
  };

  constructor(
    private router: Router,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit() {
    this.searchString = '';
      this.ad = true;
    this.adInterval = setInterval(() => {
      if (window.innerWidth > 704) {
        this.ad = false;
        this.adTimeout = setTimeout(() => {
          this.ad = true;
        }, 50);
      }
    }, 30000)

    this.betaTextHidden = this.localStorageService.get('hideBetaText') || { hidden: false };
  }

  ngOnDestroy() {
    clearInterval(this.adInterval);
    clearTimeout(this.adTimeout);
  }

  search() {
    if (this.searchString.length) {
      this.router.navigate(['/guardian', this.searchString]);
    }
  }

  route(route: any[]) {
    this.router.navigate(route);
  }

  hideBetaText() {
    this.betaTextHidden.hidden = true;
    this.localStorageService.set('hideBetaText', this.betaTextHidden);
  }

}
