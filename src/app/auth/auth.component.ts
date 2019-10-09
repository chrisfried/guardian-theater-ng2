import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  msg: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService) {
  }


  ngOnInit() {
    this.activatedRoute.queryParams.pipe(map(queryParams => {
      const code: string = queryParams['code'];
      const state: string = queryParams['state'];
      this.msg = 'Authenticating to Bungie';
      if (code != null) {
        this.authService.fetchTokenFromCode(code, state).then((success: boolean) => {
          this.msg = 'Success: ' + success;
          if (success) {
            this.router.navigate(['/']);
          }

        }).catch(x => {
          this.msg = JSON.stringify(x);
        });
      }
    })).subscribe();
  }
}
