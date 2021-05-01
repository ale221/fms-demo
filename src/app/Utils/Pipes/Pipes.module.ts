import { NgModule } from "@angular/core";
import { booleanToYesNo } from "./booleanToYesNo";
import { removeUnderScore } from './removeUnderScore';

@NgModule({

  declarations: [
    booleanToYesNo,
    removeUnderScore,
  ],

  imports: [],

  exports: [
    booleanToYesNo,
    removeUnderScore,
  ]

})

export class PipesSharedModule { }
