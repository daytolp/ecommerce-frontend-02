import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../../models/product';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly API = `${environment.apiUrl}/products`

  constructor(private http: HttpClient) {}

  getProducts(page: number, size: number): Observable<Product[]> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)

    return this.http.get<Product[]>(this.API, { params })
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.API, product)
  }

}
