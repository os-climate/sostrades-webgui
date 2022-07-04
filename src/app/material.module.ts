import { NgModule } from '@angular/core';

import { MatSliderModule } from '@angular/material/slider';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatRadioModule } from '@angular/material/radio';
import { MAT_EXPANSION_PANEL_DEFAULT_OPTIONS } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@NgModule({
  imports: [
    MatSliderModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatSelectModule,
    MatInputModule,
    MatGridListModule,
    MatExpansionModule,
    MatCardModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressBarModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatTableModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSortModule,
    MatTabsModule,
    MatListModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatRadioModule,
    MatAutocompleteModule,
    NgxMatSelectSearchModule
  ],
  exports: [
    MatSliderModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatSelectModule,
    MatInputModule,
    MatGridListModule,
    MatExpansionModule,
    MatCardModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressBarModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatTableModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSortModule,
    MatTabsModule,
    MatListModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatRadioModule,
    MatAutocompleteModule,
    NgxMatSelectSearchModule
  ],
  providers: [
    {
      provide: MAT_EXPANSION_PANEL_DEFAULT_OPTIONS,
      useValue: {
        expandedHeight: '40px',
        collapsedHeight: '30px'
      }
    }
  ]
})
export class MaterialModule { }
