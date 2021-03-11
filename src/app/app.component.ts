import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ProductFlowStoreService } from './services/product-flow.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'my-hilarious-app';
  filters = [];
  constructor(private meta: Meta, private titlemeta: Title, private productflow:ProductFlowStoreService){
  }
ngOnInit(){
  this.productflow.getfilters().subscribe((res:any) =>{
 this.filters = res.MasterFilters;
 this.titlemeta.setTitle(this.filters[0].CategoryName);
  });
}

}
