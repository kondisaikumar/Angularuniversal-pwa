import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';

import { HomepageComponent } from './pages/home/homepage/homepage.component';
import { AboutusComponent } from './pages/aboutus/aboutuscomponent';
import { OfferComponent } from './pages/offer/offer.component';
import { FiresideuntappedComponent } from './pages/home/firesideuntapped/firesideuntapped.component';
import { RecipesComponent } from './pages/recipe/recipes/recipes.component';
import { RecipeDetailsComponent } from './pages/recipe/recipe-details/recipe-details.component';
import { ProductDetailsComponent } from './pages/products/product-details/product-details.component';
import { EventDetailsComponent } from './pages/products/event-details/event-details.component';
import { MyAccountComponent } from './pages/myaccount/myaccount.component';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';

import { CartComponent } from './pages/cart/cart.component';
import { AdvanceFilterComponent } from './pages/products/advance-filter/advance-filter.component';
import { LoginComponent } from './pages/login/login.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { CouponsComponent } from './pages/coupons/coupons.component';
import { FeatureProductsComponent } from './pages/products/feature-products/feature-products.component';
import { EventsComponent } from './pages/products/events/events.component';
import { PrivacyPolicyComponent } from './pages/home/privacy-policy/privacy-policy.component';
import { TermsAndConditionsComponent } from './pages/home/terms-and-conditions/terms-and-conditions.component';
import { FaqComponent } from './pages/home/faq/faq.component';
import { AdvancedFilterAllComponent } from './pages/products/advanced-filter-all/advanced-filter-all.component';
// import { HomePageResolver } from './pages/home/homepage/homepage.resolver';

import { AuthGuard } from './auth.guard';
import { GeneralGuard } from './general.guard';
import { JobsComponent } from './pages/home/jobs/jobs.component';
import { ToppicksComponent } from './pages/toppicks/toppicks.component';
import { StaffpicksComponent } from './pages/staffpicks/staffpicks.component';

const routes: Routes = [
  { path: 'home', redirectTo: '/' },
  {
    path: '',
    component: HomepageComponent,
    // resolve: { token: HomePageResolver },
    runGuardsAndResolvers: 'always'
  },
  { path: 'aboutus', component: AboutusComponent },
  { path: 'offer', component: OfferComponent},
  { path: 'fireside-untapped', component: FiresideuntappedComponent},
  { path: 'jobs', component: JobsComponent},
  { path: 'login', component: LoginComponent },
  { path: 'feature-products', component: FeatureProductsComponent},
  { path: 'recipes', component: RecipesComponent},
  { path: 'recipe-details/:id', component: RecipeDetailsComponent},
  { path: 'product-details/:id/:storeid', component: ProductDetailsComponent },
  { path: 'event-details/:id/:storeid', component: EventDetailsComponent},
  { path: 'myaccount', loadChildren: './pages/myaccount/myaccount.module#MyAccountModule' },
  { path: 'advance-filter', component: AdvancedFilterAllComponent, runGuardsAndResolvers: 'always' },
  { path: 'beer', component: AdvanceFilterComponent, runGuardsAndResolvers: 'always'  },
  { path: 'liquor', component: AdvanceFilterComponent, runGuardsAndResolvers: 'always' },
  { path: 'wine', component: AdvanceFilterComponent, runGuardsAndResolvers: 'always' },
  { path: 'mixers-more', component: AdvanceFilterComponent, runGuardsAndResolvers: 'always'},
  { path: 'tobacco', component: AdvanceFilterComponent, runGuardsAndResolvers: 'always'},
  
  { path: 'staff-picks', component: StaffpicksComponent},
  { path: 'top-beer', component: ToppicksComponent},
  { path: 'top-liquor', component: ToppicksComponent},
  { path: 'top-wine', component: ToppicksComponent},
  { path: 'cart', component: CartComponent  },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'coupons', component: CouponsComponent },
  { path: 'events', component: EventsComponent, runGuardsAndResolvers: 'always'},
  { path: 'privacy-policy', component: PrivacyPolicyComponent, runGuardsAndResolvers: 'always' },
  { path: 'terms-conditions', component: TermsAndConditionsComponent, runGuardsAndResolvers: 'always' },
  { path: 'faq', component: FaqComponent, runGuardsAndResolvers: 'always', canActivate: [GeneralGuard] },
  { path: 'contactus', component: ContactUsComponent, runGuardsAndResolvers: 'always' },
  { path: '**', component: HomepageComponent },
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabled', anchorScrolling: 'enabled',
  useHash: false, scrollPositionRestoration: 'enabled', onSameUrlNavigation: 'reload'}), HttpClientModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
