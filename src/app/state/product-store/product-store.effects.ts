import { Injectable } from '@angular/core';

import { withLatestFrom, switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { RootStateModel } from '../../app.state';
import * as fromProductStore from '../product-store/product-store.action';
import { ProductStoreService } from '../../services/product-store.service';

@Injectable()
export class ProductStoreEffects {
    constructor(
        private actions$: Actions,
        private store: Store<RootStateModel>,
        private productStoreService: ProductStoreService) {
    }

    @Effect()
    getStoreHome$ = this.actions$.pipe(
        ofType(fromProductStore.ProductStoreActionTypes.StoreGetHome),
            withLatestFrom<fromProductStore.StoreGetHome, RootStateModel>(this.store),
            switchMap((action:any) => {
                return this.productStoreService.getStoreHome().pipe(
                    map(p => {
                        return new fromProductStore.ProductStoreActions.StoreGetHomeSuccess(p);
                    }),
                    catchError(error =>
                        of(error)
                    )
                );
            })
        );
    @Effect()
    productGetList$ = this.actions$.pipe(
        ofType(fromProductStore.ProductStoreActionTypes.ProductGetList),
            withLatestFrom<fromProductStore.ProductGetList, RootStateModel>(this.store),
            switchMap((action:any) => {
                return this.productStoreService.productGetList(action[0].payload).pipe(
                    map(p => {
                        return new fromProductStore.ProductStoreActions.ProductGetListSuccess(p);
                    }),
                    catchError(error =>
                        of(error)
                    )
                );
            })
        );
    @Effect()
    productGetDetails$ = this.actions$.pipe(
        ofType(fromProductStore.ProductStoreActionTypes.ProductGetDetails),
            withLatestFrom<fromProductStore.ProductGetDetails, RootStateModel>(this.store),
            switchMap((action:any) => {
                return this.productStoreService.productGetDetails(action[0].payload).pipe(
                    map(p => {
                        return new fromProductStore.ProductStoreActions.ProductGetDetailsSuccess(p);
                    }),
                    catchError(error =>
                        of(error)
                    )
                );
            })
        );
    @Effect()
    eventGetDetails$ = this.actions$.pipe(
        ofType(fromProductStore.ProductStoreActionTypes.EventGetDetails),
            withLatestFrom<fromProductStore.EventGetDetails, RootStateModel>(this.store),
            switchMap((action:any) => {
                return this.productStoreService.eventGetDetails(action[0].payload).pipe(
                    map(p => {
                        return new fromProductStore.ProductStoreActions.EventGetDetailsSuccess(p);
                    }),
                    catchError(error =>
                        of(error)
                    )
                );
            })
        );
}
