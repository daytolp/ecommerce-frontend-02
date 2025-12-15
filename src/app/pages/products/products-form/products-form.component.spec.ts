import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { ProductsFormComponent } from './products-form.component';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from '@angular/common';

describe('ProductsFormComponent', () => {
  let component: ProductsFormComponent;
  let fixture: ComponentFixture<ProductsFormComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  beforeEach(async () => {
  productServiceSpy = jasmine.createSpyObj('ProductService', ['createProduct']);

    await TestBed.configureTestingModule({
      imports: [
        ProductsFormComponent,
        ReactiveFormsModule,
        CommonModule,
        HttpClientTestingModule
      ],
      providers: [
        FormBuilder,
        { provide: ProductService, useValue: productServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.form.get('name')?.value).toBe('');
    expect(component.form.get('price')?.value).toBe(0);
    expect(component.form.get('stock')?.value).toBe(0);
  });

  it('should initialize alerta signal as null', () => {
    expect(component.alerta()).toBeNull();
  });

  describe('Form validation', () => {
    it('should mark name field as required', () => {
      const nameControl = component.form.get('name');
      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBeTruthy();
    });

    it('should mark price field as required', () => {
      const priceControl = component.form.get('price');
      priceControl?.setValue(null);
      expect(priceControl?.hasError('required')).toBeTruthy();
    });

    it('should validate price minimum value', () => {
      const priceControl = component.form.get('price');
      priceControl?.setValue(0);
      expect(priceControl?.hasError('min')).toBeTruthy();

      priceControl?.setValue(-1);
      expect(priceControl?.hasError('min')).toBeTruthy();

      priceControl?.setValue(1);
      expect(priceControl?.hasError('min')).toBeFalsy();
    });

    it('should mark stock field as required', () => {
      const stockControl = component.form.get('stock');
      stockControl?.setValue(null);
      expect(stockControl?.hasError('required')).toBeTruthy();
    });

    it('should validate stock minimum value', () => {
      const stockControl = component.form.get('stock');
      stockControl?.setValue(-1);
      expect(stockControl?.hasError('min')).toBeTruthy();

      stockControl?.setValue(0);
      expect(stockControl?.hasError('min')).toBeFalsy();
    });

    it('should validate form as valid when all fields are correct', () => {
      component.form.setValue({
        name: 'Producto Test',
        price: 100,
        stock: 10
      });
      expect(component.form.valid).toBeTruthy();
    });
  });

  describe('save method', () => {
    it('should show error alert when form is invalid', () => {
      component.form.setValue({
        name: '',
        price: 0,
        stock: -1
      });

      component.save();

      expect(component.alerta()).toEqual({
        mostrar: true,
        mensaje: 'Por favor complete todos los campos requeridos correctamente.',
        color: 'danger'
      });
      expect(productServiceSpy.createProduct).not.toHaveBeenCalled();
    });

    it('should create product successfully when form is valid', () => {
      const productData = {
        name: 'Producto Test',
        price: 100,
        stock: 10
      };

      component.form.setValue(productData);
      productServiceSpy.createProduct.and.returnValue(of({ id: 1, ...productData }));

      component.save();

      expect(productServiceSpy.createProduct).toHaveBeenCalledWith(productData);
      expect(component.alerta()).toEqual({
        mostrar: true,
        mensaje: 'Producto creado exitosamente.',
        color: 'success'
      });
      expect(component.form.get('name')?.value).toBe('');
      expect(component.form.get('price')?.value).toBeNull();
      expect(component.form.get('stock')?.value).toBeNull();
    });

    it('should show error alert when product creation fails', () => {
      const productData = {
        name: 'Producto Test',
        price: 100,
        stock: 10
      };

      component.form.setValue(productData);
      productServiceSpy.createProduct.and.returnValue(throwError(() => new Error('API Error')));

      component.save();

      expect(productServiceSpy.createProduct).toHaveBeenCalledWith(productData);
      expect(component.alerta()).toEqual({
        mostrar: true,
        mensaje: 'Error al crear el producto. Intente nuevamente.',
        color: 'danger'
      });
    });

    it('should not reset form when creation fails', () => {
      const productData = {
        name: 'Producto Test',
        price: 100,
        stock: 10
      };

      component.form.setValue(productData);
      productServiceSpy.createProduct.and.returnValue(throwError(() => new Error('API Error')));

      component.save();

      expect(component.form.get('name')?.value).toBe('Producto Test');
      expect(component.form.get('price')?.value).toBe(100);
      expect(component.form.get('stock')?.value).toBe(10);
    });

    it('should validate that form values are passed correctly to service', () => {
      const productData = {
        name: 'Laptop Gaming',
        price: 1500,
        stock: 5
      };

      component.form.setValue(productData);
      productServiceSpy.createProduct.and.returnValue(of({ id: 1, ...productData }));

      component.save();

      expect(productServiceSpy.createProduct).toHaveBeenCalledWith({
        name: 'Laptop Gaming',
        price: 1500,
        stock: 5
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle form with partial valid data', () => {
      component.form.patchValue({
        name: 'Producto válido',
        price: 50
        // stock queda en 0 (valor por defecto, válido)
      });

      productServiceSpy.createProduct.and.returnValue(of({ id: 1, name: 'Producto válido', price: 50, stock: 0 }));

      component.save();

      expect(productServiceSpy.createProduct).toHaveBeenCalled();
      expect(component.alerta()?.color).toBe('success');
    });

    it('should handle service returning null/undefined', () => {
      component.form.setValue({
        name: 'Test Product',
        price: 100,
        stock: 10
      });

      productServiceSpy.createProduct.and.returnValue(of(null as any));

      component.save();

      expect(component.alerta()?.color).toBe('success');
      expect(component.form.get('name')?.value).toBe('');
    });
  });
});
