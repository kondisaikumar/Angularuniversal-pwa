import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { CustomerService } from '../../../services/customer.service';
//  
import { ProgressBarService } from '../../../shared/services/progress-bar.service';
import { ToastrService } from 'ngx-toastr';
import { VantivPaymentServerSideApiService } from '../../../services/vantiv-payment-serverside-api.service';

@Component({
  selector: 'app-manage-addresses',
  templateUrl: './manage-addresses.component.html',
  styleUrls: ['./manage-addresses.component.scss']
})
export class ManageAddressesComponent implements OnInit {
addressList: any;
  clickedAddressId: any="";
  constructor(private customerService: CustomerService,
    //  
    private toastr: ToastrService,
    private progressBarService: ProgressBarService,
    private renderer: Renderer2,
    private vantivPaymentService: VantivPaymentServerSideApiService) {
      this.renderer.listen('window', 'click',(e:Event)=>{
        const clickedElement = e.target as HTMLElement;
        if(clickedElement.id !== "delButton"){
          this.clickedAddressId="";
        }
      }); 
     }

  ngOnInit() {
   this.getAddressList();
  }

  getAddressList() {
    if (this.customerService.customerAddressList && this.customerService.customerAddressList.ListAddress) {
      this.addressList = this.customerService.customerAddressList.ListAddress;
      this.addressList = this.addressList.sort((x, y) => x.IsDefault > y.IsDefault ? -1 : 1 );
      if ( this.addressList && this.addressList.length > 0) {
        this.vantivPaymentService.setBillingAddress(this.addressList[0]);
      }
    } else {
      
      this.progressBarService.show();
      this.customerService.getCustomerAddressList().subscribe(
        data => {
          this.addressList = data ? (data.ListAddress ? data.ListAddress : []) : [];
          this.addressList = this.addressList.sort((x, y) => x.IsDefault > y.IsDefault ? -1 : 1 );
          
          if ( this.addressList && this.addressList.length > 0) {
            this.vantivPaymentService.setBillingAddress(this.addressList[0]);
          }
          this.progressBarService.hide();
        });
    }
  }
  onDropdownClick(Id:any){
  this.clickedAddressId=Id

  }
  addToFavorite(address: any) {
    const updatedAddress = {
      AddressId: address.AddressId,
      FirstName: address.FirstName,
      LastName: address.LastName,
      AddressName: address.AddressName,
      Address1: address.Address1,
      Address2: address.Address2,
      City: address.City,
      State: address.State,
      Zip: address.Zip,
      ContactNo: address.ContactNo,
      Country: address.Country,
      IsDefault: 1,
      IsProfileUpdate: address.IsProfileUpdate,
      StoreId: 0, SessionId: '', UserId: 0, AppId: 0, DeviceId: '', DeviceType: ''};

    this.addressList.map(item => item.IsDefault = false);

    
    this.progressBarService.show();
    this.customerService.UpdateAddress(updatedAddress).subscribe(
      data => {
        if (data) {
          this.toastr.success(data.SuccessMessage);
          address.IsDefault = data.IsDefault;
          this.addressList = this.addressList.sort((x, y) => x.IsDefault > y.IsDefault ? -1 : 1 );
        }
        
        this.progressBarService.hide();
      });
  }

  deleteAddress(address: any) {
    
    this.progressBarService.show();
    this.customerService.DeleteAddress(address.AddressId).subscribe(
      data => {
        this.toastr.success(data.SuccessMessage);
        this.addressList.splice(this.addressList.indexOf(address), 1);
        
        this.progressBarService.hide();
      });
  }

}
