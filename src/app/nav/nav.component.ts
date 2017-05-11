import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(
    private router: Router
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

}
