import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  private searchString: string;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    this.searchString = '';
  }

  search() {
    this.router.navigate(['/guardian', this.searchString]);
  }

}
