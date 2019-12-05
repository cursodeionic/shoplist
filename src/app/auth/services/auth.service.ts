import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase/app';
import { BehaviorSubject } from 'rxjs';

import { AuthData } from '../models/auth';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

  public hasAuthUser = new BehaviorSubject(false);

  constructor(
    private storage: Storage,
    private platform: Platform
  ) {
    this.platform.ready().then(() => {
      this.loadAuthUser();
    });
  }

  loadAuthUser() {
    this.storage.get('auth:info').then((response) => {
      if (response) {
        this.hasAuthUser.next(true);
      }
    });
  }

  register(user: AuthData) {
    return new Promise<any>((resolve, reject) => {
      firebase
        .auth()
        .createUserWithEmailAndPassword(user.email, user.password)
        .then(
          response => resolve(response),
          error => reject(error)
        );
    });
  }

  login(user: AuthData) {
    return new Promise<any>((resolve, reject) => {
      firebase
          .auth()
          .signInWithEmailAndPassword(user.email, user.password)
          .then(
            async response => {
              await this.storage.set('auth:info', response);
              resolve(response);
            },
            error => reject(error)
          );
    });
  }

  logout() {
    return new Promise((resolve, reject) => {
      if (firebase.auth().currentUser) {
        firebase
            .auth()
            .signOut()
            .then(async () => {
              this.hasAuthUser.next(false);
              await this.storage.remove('auth:info');
              resolve();
            })
            .catch(error => {
              reject();
            });
      }
    });
  }

  userDetails() {
    return firebase.auth().currentUser;
  }

  isAuthenticated() {
    return this.hasAuthUser.value;
  }
}
