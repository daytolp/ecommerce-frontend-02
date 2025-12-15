import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../../models/product';
import { environment } from '../../../environment/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const API_URL = `${environment.apiUrl}/products`;

  const mockProducts: Product[] = [
    { id: 1, name: 'Laptop', price: 1500, stock: 10 },
    { id: 2, name: 'Mouse', price: 25, stock: 50 },
    { id: 3, name: 'Keyboard', price: 75, stock: 30 }
  ];

  const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    price: 100,
    stock: 20
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    it('should retrieve products with pagination parameters', () => {
      const page = 1;
      const size = 5;

      service.getProducts(page, size).subscribe(products => {
        expect(products).toEqual(mockProducts);
        expect(products.length).toBe(3);
      });

      const req = httpMock.expectOne(`${API_URL}?page=${page}&size=${size}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe(page.toString());
      expect(req.request.params.get('size')).toBe(size.toString());

      req.flush(mockProducts);
    });

    it('should handle different pagination parameters', () => {
      const page = 3;
      const size = 10;

      service.getProducts(page, size).subscribe(products => {
        expect(products).toEqual(mockProducts);
      });

      const req = httpMock.expectOne(`${API_URL}?page=${page}&size=${size}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('3');
      expect(req.request.params.get('size')).toBe('10');

      req.flush(mockProducts);
    });

    it('should handle empty response', () => {
      const page = 1;
      const size = 5;

      service.getProducts(page, size).subscribe(products => {
        expect(products).toEqual([]);
        expect(products.length).toBe(0);
      });

      const req = httpMock.expectOne(`${API_URL}?page=${page}&size=${size}`);
      expect(req.request.method).toBe('GET');

      req.flush([]);
    });

    it('should handle HTTP error response', () => {
      const page = 1;
      const size = 5;
      const errorMessage = 'Server error';

      service.getProducts(page, size).subscribe({
        next: () => fail('Should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      });

      const req = httpMock.expectOne(`${API_URL}?page=${page}&size=${size}`);
      expect(req.request.method).toBe('GET');

      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network error', () => {
      const page = 1;
      const size = 5;

      service.getProducts(page, size).subscribe({
        next: () => fail('Should have failed with network error'),
        error: (error) => {
          expect(error.error).toBeInstanceOf(ProgressEvent);
        }
      });

      const req = httpMock.expectOne(`${API_URL}?page=${page}&size=${size}`);

      req.error(new ProgressEvent('Network error'));
    });

    it('should build correct URL with API endpoint', () => {
      const page = 1;
      const size = 5;

      service.getProducts(page, size).subscribe();

      const req = httpMock.expectOne(`${API_URL}?page=${page}&size=${size}`);
      expect(req.request.url).toBe(API_URL);

      req.flush(mockProducts);
    });

    it('should handle zero page and size parameters', () => {
      const page = 0;
      const size = 0;

      service.getProducts(page, size).subscribe(products => {
        expect(products).toEqual(mockProducts);
      });

      const req = httpMock.expectOne(`${API_URL}?page=${page}&size=${size}`);
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('0');

      req.flush(mockProducts);
    });
  });

  describe('createProduct', () => {
    it('should create a new product', () => {
      const newProduct: Product = {
        name: 'New Product',
        price: 150,
        stock: 25
      };

      const createdProduct: Product = { ...newProduct, id: 4 };

      service.createProduct(newProduct).subscribe(product => {
        console.log('Created Product:', product);
        expect(product).toEqual(createdProduct);
        expect(product.id).toBe(4);
        expect(product.name).toBe(newProduct.name);
        expect(product.price).toBe(newProduct.price);
        expect(product.stock).toBe(newProduct.stock);
      });

      // ✅ Agregar estas líneas que faltaban
      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProduct);

      req.flush(createdProduct);
    });

    it('should create product with minimal data', () => {
      const minimalProduct: Product = {
        name: 'Minimal Product',
        price: 1,
        stock: 0
      };

      const createdProduct: Product = { ...minimalProduct, id: 5 };

      service.createProduct(minimalProduct).subscribe(product => {
        expect(product).toEqual(createdProduct);
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(minimalProduct);

      req.flush(createdProduct);
    });

    it('should create product with existing id (update scenario)', () => {
      const existingProduct: Product = {
        id: 1,
        name: 'Updated Product',
        price: 200,
        stock: 15
      };

      service.createProduct(existingProduct).subscribe(product => {
        expect(product).toEqual(existingProduct);
        expect(product.id).toBe(1);
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(existingProduct);

      req.flush(existingProduct);
    });

    it('should handle validation error response', () => {
      const invalidProduct: Product = {
        name: '',
        price: -10,
        stock: -5
      };

      const errorResponse = {
        error: 'Validation failed',
        message: 'Invalid product data'
      };

      service.createProduct(invalidProduct).subscribe({
        next: () => fail('Should have failed with validation error'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
          expect(error.error).toEqual(errorResponse);
        }
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');

      req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle server error during creation', () => {
      const product: Product = {
        name: 'Test Product',
        price: 100,
        stock: 10
      };

      service.createProduct(product).subscribe({
        next: () => fail('Should have failed with server error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');

      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network error during creation', () => {
      const product: Product = {
        name: 'Test Product',
        price: 100,
        stock: 10
      };

      service.createProduct(product).subscribe({
        next: () => fail('Should have failed with network error'),
        error: (error) => {
          expect(error.error).toBeInstanceOf(ProgressEvent);
        }
      });

      const req = httpMock.expectOne(API_URL);

      req.error(new ProgressEvent('Network error'));
    });

    it('should send correct content-type header', () => {
      const product: Product = {
        name: 'Test Product',
        price: 100,
        stock: 10
      };

      service.createProduct(product).subscribe();

      const req = httpMock.expectOne(API_URL);
      expect(req.request.headers.has('Content-Type')).toBe(false);

      req.flush({ ...product, id: 1 });
    });
  });

  describe('API configuration', () => {
    it('should use correct API endpoint from environment', () => {
      const expectedApi = `${environment.apiUrl}/products`;

      // Access private property for testing
      const api = (service as any).API;
      expect(api).toBe(expectedApi);
      expect(api).toContain('http://localhost:3000/api/products');
    });

    it('should maintain consistent API URL across methods', () => {
      service.getProducts(1, 5).subscribe();
      service.createProduct(mockProduct).subscribe();

      const requests = httpMock.match(() => true);
      expect(requests.length).toBe(2);

      requests.forEach(req => {
        expect(req.request.url).toBe(API_URL);
      });

      requests.forEach(req => req.flush([]));
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple concurrent requests', () => {
      const product1: Product = { name: 'Product 1', price: 100, stock: 10 };
      const product2: Product = { name: 'Product 2', price: 200, stock: 20 };

      let response1: Product | undefined;
      let response2: Product[] | undefined;

      service.createProduct(product1).subscribe(p => response1 = p);
      service.getProducts(1, 10).subscribe(p => response2 = p);

      const createReq = httpMock.expectOne(req => req.method === 'POST');
      const getReq = httpMock.expectOne(req => req.method === 'GET');

      createReq.flush({ ...product1, id: 1 });
      getReq.flush([product1, product2]);

      expect(response1).toEqual({ ...product1, id: 1 });
      expect(response2).toEqual([product1, product2]);
    });

    it('should handle sequential operations', () => {
      const newProduct: Product = { name: 'Sequential Product', price: 300, stock: 5 };
      const createdProduct: Product = { ...newProduct, id: 10 };

      // First create a product
      service.createProduct(newProduct).subscribe(created => {
        expect(created).toEqual(createdProduct);

        // Then fetch products
        service.getProducts(1, 5).subscribe(products => {
          expect(products).toContain(jasmine.objectContaining(createdProduct));
        });
      });

      const createReq = httpMock.expectOne(req => req.method === 'POST');
      createReq.flush(createdProduct);

      const getReq = httpMock.expectOne(req => req.method === 'GET');
      getReq.flush([createdProduct]);
    });
  });
});
