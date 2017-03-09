import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pgcr',
  templateUrl: './pgcr.component.html',
  styleUrls: ['./pgcr.component.scss']
})
export class PgcrComponent implements OnInit {
  @Input() pgcr: bungie.PostGameCarnageReport;

  constructor() { }

  ngOnInit() {
  }

}
