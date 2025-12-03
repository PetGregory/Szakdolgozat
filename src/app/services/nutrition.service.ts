import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, of } from 'rxjs';


export interface NutritionItem {
  name: string;
  calories: number;
  protein_g: number;
  serving_size_g: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  amount: number;
  calories: number;
  protein: number;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class NutritionService {
  private apiUrl = 'https://world.openfoodfacts.org/cgi/search.pl';

  constructor(
    private http: HttpClient  ) {}

  searchFood(query: string): Observable<NutritionItem[]> {
    const url = `${this.apiUrl}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`;

    return this.http.get<any>(url).pipe(
      switchMap((res: any) => {
        if (!res.products || res.products.length === 0) return of([]);

        const items = res.products
          .filter((p: any) => p.nutriments && p.nutriments['energy-kcal_100g'])
          .map((p: any) => {
            const n = p.nutriments || {};
            return {
              name: p.product_name || p.product_name_en || 'Unknown',
              calories: Number(n['energy-kcal_100g']) || 0,
              protein_g: Number(n['proteins_100g']) || 0,
              serving_size_g: 100
            };
          })
          .filter((item: NutritionItem) => item.calories > 0);

        return of(items);
      })
    );
  }

  calculateCaloriesForAmount(item: NutritionItem | null, grams: number): number {
    if (!item || !item.calories || !item.serving_size_g) return 0;
    return Math.round((item.calories / item.serving_size_g) * grams) || 0;
  }

  calculateProteinForAmount(item: NutritionItem | null, grams: number): number {
    if (!item || !item.protein_g || !item.serving_size_g) return 0;
    return Math.round((item.protein_g / item.serving_size_g) * grams) || 0;
  }
}

