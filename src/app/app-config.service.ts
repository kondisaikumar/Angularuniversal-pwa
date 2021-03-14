import { Injectable, Output, EventEmitter, PLATFORM_ID, Inject } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
// import { truncateSync } from 'fs';

export const baseURL = 'https://staging.liquorapps.com/Bcapi/api/';
export const facebookProviderID = '502181350180492';

export enum SmartBannerInfo {
  title = 'BC Starter',
  author = 'Critical Telephone Applications, Inc'
}

export enum AuthorizeNetURLs {
  sandBox_URL = 'https://apitest.authorize.net/xml/v1/request.api',
  prod_URL = 'https://api.authorize.net/xml/v1/request.api'
}
export enum VantivURLs {
  hostedPayments = 'https://certtransaction.hostedpayments.com/?TransactionSetupID=',
  return_URL = 'https://staging.liquorapps.com/Store/Vantiv',
}

export enum ValidationsModes {
  test = 'testMode',
  live = 'liveMode'
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  canada = false;
  offer = 'false';
  liquorWorldJobs = 'false';
  fireside = 'false';
  downloadapp = 'true';
  partners = 'false';
  showEventsInCaurosel = false;
appVersion = '11';
  deviceID = '';
  storeID = 0;
  appID = 10002;
  URL = '';

  merchantAuthentication = {
    vAppLoginId: '#@@#',
    vTransactionKey: '#$$#'
  };
  validationMode = '';

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (localStorage.getItem('storeId') && localStorage.getItem('storeId') !== '0') {
      this.storeID = +localStorage.getItem('storeId');
    }
  }

  getLoginCustomerParams(email?: string, pwd?: string, loginType?: string, sourceId?: string) {

    this.deviceID = localStorage.getItem('deviceId');
    if (this.deviceID === null) {
      this.deviceID = Math.random().toString(36).substring(2);
      localStorage.setItem('deviceId', this.deviceID);
    }

    // if (this.deviceID.length <= 20) {
    //   this.getFirebaseDeviceID();
    // }
    return {
      AppId: this.appID, // 10275,
      AppVersion: this.appVersion,
      DeviceId: this.deviceID,
      DeviceType: 'W',
      EmailId: email || '',
      LoginType: loginType || 'B',
      Password: pwd || '',
      StoreId: this.storeID, // 10275,
      SourceId: sourceId || '',
      SessionId: sessionStorage.getItem('SessionId') || '',
      UserId: '',
      UserIp: ''
    };
  }

  // getFirebaseDeviceID() {
  //   this.angularFireMessaging.requestToken.subscribe(
  //     (token) => {
  //       if (token) {
  //         // console.log(token);
  //         localStorage.setItem('deviceId', token);
  //       }
  //     });
  // }

  decryptionKeyandTransaction(Credential1, Credential2, Credential3, StoreID) {
    if (Credential3 === 'T') {
      this.merchantAuthentication.vAppLoginId = '#@@#';
      this.merchantAuthentication.vTransactionKey = '#$$#';
    } else if (Credential3 === 'L') {
      this.merchantAuthentication.vAppLoginId = '#@@#';
      this.merchantAuthentication.vTransactionKey = '#$$#';
    }
  }
}
