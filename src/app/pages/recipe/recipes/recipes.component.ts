import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../../../services/recipe.service';
import { Router } from '@angular/router';
//  
import { ProgressBarService } from '../../../shared/services/progress-bar.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent implements OnInit {
  recipeList: any;
  page = 1;

  constructor(private router: Router,
    private recipeService: RecipeService,
    //  
    private progressBarService: ProgressBarService,
    private commonService:CommonService) { }

  ngOnInit() {
    this.getRecipes();
    this.commonService.updateMeta('Recipe')
  }

  getRecipes() {
    /* if (this.recipeService.recipesList && this.recipeService.recipesList.ListRecipe) {
      this.recipeList = this.recipeService.recipesList;
    } else { */
    
    this.progressBarService.show();
    this.recipeService.getRecipeList(this.page).subscribe(
      (data: any) => {
        this.recipeList = data ? (data.ListRecipe ? data : []) : [];
        
        this.progressBarService.hide();
      });
  }

  onRecipeSelection(recipe: any) {
    // routerLink="/recipe-details/{{recipe.RecipeId}}"
    this.recipeService.selectedRecipe = recipe;
    this.router.navigate([`/recipe-details/${recipe.RecipeId}`]);
  }

  onPageChange(pageNo) {
    this.page = pageNo;
    this.getRecipes();
  }
}
