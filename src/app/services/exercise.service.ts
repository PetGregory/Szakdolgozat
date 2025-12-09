import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  gifUrl: string;
  instructions?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private apiUrl = environment.exerciseDbApiUrl || 'https://www.exercisedb.dev/api/v1';

  constructor(private http: HttpClient) {}

  searchExercises(query: string, bodyPart?: string): Observable<Exercise[]> {
    if (!query.trim()) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    let url = `${this.apiUrl}/exercises/filter?offset=0&limit=100&search=${encodeURIComponent(query)}`;
    if (bodyPart && bodyPart.trim()) {
      url += `&bodyParts=${encodeURIComponent(bodyPart)}`;
    }

    return this.http.get<any>(url).pipe(
      map((response: any) => {
        let exercises: any[] = [];
        
        if (response && response.success && Array.isArray(response.data)) {
          exercises = response.data;
        } else if (Array.isArray(response)) {
          exercises = response;
        } else if (response && Array.isArray(response.data)) {
          exercises = response.data;
        } else if (response && response.exercises && Array.isArray(response.exercises)) {
          exercises = response.exercises;
        } else if (response && response.results && Array.isArray(response.results)) {
          exercises = response.results;
        }
        
        if (exercises.length === 0) {
          return [];
        }
        
        return exercises.slice(0, 20).map((ex: any) => {
          const exerciseName = ex.name || 'Exercise';
          const exerciseId = ex.exerciseId || ex.id || ex._id || '';
          
          const bodyParts = ex.bodyParts || (ex.bodyPart ? [ex.bodyPart] : []);
          const equipments = ex.equipments || ex.equipment || (ex.equipment ? [ex.equipment] : []);
          const targetMuscles = ex.targetMuscles || (ex.target ? [ex.target] : []);
          
          let imageUrl = '';
          if (ex.gifUrl) {
            imageUrl = ex.gifUrl;
          } else if (ex.gif) {
            imageUrl = ex.gif;
          } else if (ex.imageUrl) {
            if (ex.imageUrl.startsWith('http')) {
              imageUrl = ex.imageUrl;
            } else {
              imageUrl = `https://exercisedb.dev/images/${ex.imageUrl}`;
            }
          } else if (ex.images && ex.images.length > 0) {
            imageUrl = ex.images[0];
          }
          
          const bodyPartStr = Array.isArray(bodyParts) ? bodyParts.join(', ') : (bodyParts || '');
          const equipmentStr = Array.isArray(equipments) ? equipments.join(', ') : (equipments || '');
          const targetStr = Array.isArray(targetMuscles) ? targetMuscles.join(', ') : (targetMuscles || '');
          
          return {
            id: exerciseId.toString(),
            name: exerciseName,
            bodyPart: bodyPartStr,
            equipment: equipmentStr,
            target: targetStr,
            gifUrl: imageUrl || `https://via.placeholder.com/200?text=${encodeURIComponent(exerciseName)}`,
            instructions: ex.instructions || []
          };
        });
      }),
      catchError((error) => {
        console.error('ExerciseDB API error:', error);
        return new Observable<Exercise[]>(observer => {
          observer.next([]);
          observer.complete();
        });
      })
    );
  }

  getExerciseById(id: string): Observable<Exercise | null> {
    if (!id) {
      return new Observable(observer => {
        observer.next(null);
        observer.complete();
      });
    }

    const url = `${this.apiUrl}/exercises/${id}`;

    return this.http.get<any>(url).pipe(
      map((ex: any) => {
        if (!ex) {
          return null;
        }
        
        const exerciseName = ex.name || 'Exercise';
        const exerciseId = ex.exerciseId || ex.id || ex._id || id;
        
        const bodyParts = ex.bodyParts || (ex.bodyPart ? [ex.bodyPart] : []);
        const equipments = ex.equipments || ex.equipment || (ex.equipment ? [ex.equipment] : []);
        const targetMuscles = ex.targetMuscles || (ex.target ? [ex.target] : []);
        
        let imageUrl = '';
        if (ex.gifUrl) {
          imageUrl = ex.gifUrl;
        } else if (ex.gif) {
          imageUrl = ex.gif;
        } else if (ex.imageUrl) {
          if (ex.imageUrl.startsWith('http')) {
            imageUrl = ex.imageUrl;
          } else {
            imageUrl = `https://exercisedb.dev/images/${ex.imageUrl}`;
          }
        } else if (ex.images && ex.images.length > 0) {
          imageUrl = ex.images[0];
        }
        
        const bodyPartStr = Array.isArray(bodyParts) ? bodyParts.join(', ') : (bodyParts || '');
        const equipmentStr = Array.isArray(equipments) ? equipments.join(', ') : (equipments || '');
        const targetStr = Array.isArray(targetMuscles) ? targetMuscles.join(', ') : (targetMuscles || '');
        
        return {
          id: exerciseId.toString(),
          name: exerciseName,
          bodyPart: bodyPartStr,
          equipment: equipmentStr,
          target: targetStr,
          gifUrl: imageUrl || `https://via.placeholder.com/200?text=${encodeURIComponent(exerciseName)}`,
          instructions: ex.instructions || []
        };
      }),
      catchError((error) => {
        console.warn('ExerciseDB API error getting exercise by ID:', error);
        return new Observable<Exercise | null>(observer => {
          observer.next(null);
          observer.complete();
        });
      })
    );
  }
}

