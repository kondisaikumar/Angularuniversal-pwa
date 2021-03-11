import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { baseUrl, UrlNames } from "./url-provider"
@Injectable({
providedIn: 'root'
})
export class ProductFlowStoreService {
    constructor(private http: HttpClient){}
getfilters(): Observable<any> {
    return this.http.get<any>(baseUrl + UrlNames.MasterFilters)
}
}