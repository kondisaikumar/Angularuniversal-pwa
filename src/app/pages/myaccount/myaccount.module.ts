import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { MyAccountRoutingModule  } from './myaccount-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import { MyAccountComponent } from './myaccount.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { ManageAddressesComponent } from './manage-addresses/manage-addresses.component';
import { PaymentMethodsComponent } from './payment-methods/payment-methods.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { AddNewAddressComponent } from './manage-addresses/add-new-address/add-new-address.component';
import { AddNewPaymentComponent } from './payment-methods/add-new-payment/add-new-payment.component';
import { EditAddressComponent } from './manage-addresses/edit-address/edit-address.component';
import { AddNewCardComponent } from './vantiv-payment-methods/add-new-card/add-new-card.component';
import { VantivPaymentMethodsComponent } from './vantiv-payment-methods/vantiv-payment-methods.component';
import { CaptchapaymentComponent } from './payment-methods/captchapayment/captchapayment.component';
import { AddauthpaymentComponent } from './payment-methods/addauthpayment/addauthpayment.component';

@NgModule({
  exports: [
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule
  ],
  imports: [
    CommonModule,
    MyAccountRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule
  ],
  declarations: [
      MyAccountComponent,
      ProfileComponent,
      ProfileEditComponent,
      ManageAddressesComponent,
      PaymentMethodsComponent,
      FavoritesComponent,
      AddNewAddressComponent,
      AddNewPaymentComponent,
      EditAddressComponent,
      AddNewCardComponent,
      VantivPaymentMethodsComponent,
      CaptchapaymentComponent,
      AddauthpaymentComponent
    ]
})
export class MyAccountModule { }
