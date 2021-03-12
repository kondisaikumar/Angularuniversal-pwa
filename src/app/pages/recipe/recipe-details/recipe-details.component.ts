import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../../../services/recipe.service';
import { ActivatedRoute, Router } from '@angular/router';

import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-recipe-details',
  templateUrl: './recipe-details.component.html',
  styleUrls: ['./recipe-details.component.scss']
})
export class RecipeDetailsComponent implements OnInit {
  recipe: any;
  constructor(private route: ActivatedRoute, private recipeService: RecipeService,private commonService:CommonService) { }

  ngOnInit() {
    this.commonService.updateMeta('Recipe Details')
       
    const recipeId = +this.route.snapshot.paramMap.get('id');

      this.recipeService.getRecipeGetDetail(recipeId).subscribe((data: any) => {
        this.recipe = data.RecipeDetail;
      });
  }

}
