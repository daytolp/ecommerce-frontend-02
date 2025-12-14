import { Component } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.css'
})
export class ProductsListComponent {

  products: any[] = []
  page = 1
  size = 5

  constructor(private service: ProductService) {}

  ngOnInit() {
    this.load()
  }

  load() {
    this.service.getProducts(this.page, this.size)
      .subscribe(response => {
        this.products = response
      })
  }

  next() {
    this.page++
    this.load()
  }

  prev() {
    if (this.page > 1) {
      this.page--
      this.load()
    }
  }
}
