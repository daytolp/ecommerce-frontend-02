import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './products-form.component.html',
  styleUrl: './products-form.component.css'
})
export class ProductsFormComponent {
  public alerta = signal<{ mostrar: boolean, mensaje: string, color: string } | null>(null);
  form = this.fb.group({
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    stock: [0, [Validators.required, Validators.min(0)]]
  })

  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {}

  save() {
    if (this.form.invalid) {
      this.alerta.set({ mostrar: true, mensaje: 'Por favor complete todos los campos requeridos correctamente.', color: 'danger' });
      return
    }

    this.productService.createProduct(this.form.value as any).subscribe({
      next: () => {
        this.form.reset()
             this.alerta.set({ mostrar: true, mensaje: 'Producto creado exitosamente.', color: 'success' });
      },
      error: () => {
        this.alerta.set({ mostrar: true, mensaje: 'Error al crear el producto. Intente nuevamente.', color: 'danger' });
      }
    });
  }

}
