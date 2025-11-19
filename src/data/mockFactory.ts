import { faker } from '@faker-js/faker';
import {
  User,
  UserRole,
  UserStatus,
  Product,
  ProductStatus,
  InventoryType,
  Order,
  OrderStatus,
  OrderItem,
  Address,
  Customer,
  CustomerSegment,
} from '../types/core';

// --- Helpers ---

const randomEnum = <T>(anEnum: T): T[keyof T] => {
  const enumValues = Object.values(anEnum as object) as T[keyof T][];
  return faker.helpers.arrayElement(enumValues);
};

const generateAddress = (): Address => ({
  street: faker.location.streetAddress(),
  city: faker.location.city(),
  state: faker.location.state(),
  zipCode: faker.location.zipCode(),
  country: faker.location.country(),
});

// --- Generators ---

export const createMockUser = (): User => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    id: faker.string.uuid(),
    email: faker.internet.email({ firstName, lastName }),
    fullName: `${firstName} ${lastName}`,
    role: randomEnum(UserRole),
    avatarUrl: faker.image.avatar(),
    status: randomEnum(UserStatus),
    lastLogin: faker.date.recent({ days: 30 }),
    metadata: {
      loginCount: faker.number.int({ min: 1, max: 100 }),
      preferences: {
        theme: faker.helpers.arrayElement(['light', 'dark']),
        notifications: faker.datatype.boolean(),
      },
    },
  };
};

export const createMockCustomer = (): Customer => {
  const user = createMockUser();
  // Customers usually have a simpler role, or we can override it.
  // For this mock, we'll just extend the user properties.
  
  return {
    ...user,
    role: UserRole.STORE_MANAGER, // or just keep random, but customers might not be in UserRole enum in this specific type definition if it's for backoffice users. 
    // Wait, the type definition says "Customer extends User". 
    // And UserRole has 'SUPER_ADMIN', 'STORE_MANAGER', etc. 
    // It seems Customer might be a different kind of entity in a real app, 
    // but here it extends User. Let's assume they are "users" of the platform 
    // but with extra customer data? Or maybe we should just ignore the role for customers 
    // if they are end-users. Let's set a default or random.
    pointsBalance: faker.number.int({ min: 0, max: 5000 }),
    lifetimeValue: faker.number.float({ min: 0, max: 10000, multipleOf: 0.01 }),
    segment: randomEnum(CustomerSegment),
    addresses: faker.helpers.multiple(generateAddress, { count: { min: 1, max: 3 } }),
  };
};

const BEER_ADJECTIVES = ['Hoppy', 'Golden', 'Dark', 'Crisp', 'Smooth', 'Bitter', 'Citrus', 'Amber', 'Imperial', 'Pale'];
const BEER_NOUNS = ['IPA', 'Lager', 'Stout', 'Ale', 'Pilsner', 'Porter', 'Saison', 'Wheat', 'Bock', 'Dubbel'];

export const createMockProduct = (): Product => {
  const name = `${faker.helpers.arrayElement(BEER_ADJECTIVES)} ${faker.helpers.arrayElement(BEER_NOUNS)} ${faker.word.noun()}`;
  const basePrice = faker.number.float({ min: 5, max: 50, multipleOf: 0.5 });
  
  return {
    id: faker.string.uuid(),
    sku: `BEER-${faker.string.alphanumeric(6).toUpperCase()}`,
    name,
    slug: faker.helpers.slugify(name).toLowerCase(),
    description: faker.commerce.productDescription(),
    richDescription: `<p>${faker.lorem.paragraphs(2)}</p>`,
    basePrice,
    images: [faker.image.urlLoremFlickr({ category: 'beer' }), faker.image.urlLoremFlickr({ category: 'brewery' })],
    category: faker.helpers.arrayElement(['IPA', 'Lager', 'Stout', 'Ale', 'Specialty']),
    tags: faker.helpers.multiple(() => faker.word.adjective(), { count: { min: 1, max: 5 } }),
    status: randomEnum(ProductStatus),
    inventoryType: randomEnum(InventoryType),
  };
};

export const createMockOrder = (products: Product[], customers: Customer[]): Order => {
  const customer = faker.helpers.arrayElement(customers);
  const itemsCount = faker.number.int({ min: 1, max: 5 });
  
  const items: OrderItem[] = Array.from({ length: itemsCount }).map(() => {
    const product = faker.helpers.arrayElement(products);
    const quantity = faker.number.int({ min: 1, max: 6 });
    // Simple logic: price is basePrice. In real app, variant logic would apply.
    const unitPrice = product.basePrice; 
    
    return {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      quantity,
      unitPrice,
      totalPrice: unitPrice * quantity,
    };
  });

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return {
    id: faker.string.uuid(),
    orderNumber: `ORD-${faker.string.numeric(6)}`,
    customerId: customer.id,
    totalAmount,
    status: randomEnum(OrderStatus),
    items,
    shippingAddress: faker.helpers.arrayElement(customer.addresses) || generateAddress(),
    billingAddress: faker.helpers.arrayElement(customer.addresses) || generateAddress(),
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: faker.date.recent(),
  };
};

export const createMockCharacter = (): Character => {
  const name = faker.person.firstName();
  const role = faker.person.jobTitle();
  const color = faker.color.rgb();
  return {
    id: faker.string.uuid(),
    name,
    role,
    color,
    fullBodyArtUrl: faker.image.urlLoremFlickr({ category: 'character', width: 200, height: 300 }),
  };
};

export const MOCK_CHARACTERS = faker.helpers.multiple(createMockCharacter, { count: 10 });

// --- Static Data Exports ---

export const MOCK_USERS = faker.helpers.multiple(createMockUser, { count: 50 });

// Create some products first to use in orders
export const MOCK_PRODUCTS = faker.helpers.multiple(createMockProduct, { count: 20 });

// Create some customers (extending users or separate, let's make a dedicated list for orders)
// We'll treat them as "Users" that are customers for the sake of the order linkage, 
// or creates a separate list if needed. 
// The Order type references `customerId`.
export const MOCK_CUSTOMERS = faker.helpers.multiple(createMockCustomer, { count: 50 });

export const MOCK_ORDERS = faker.helpers.multiple(
  () => createMockOrder(MOCK_PRODUCTS, MOCK_CUSTOMERS),
  { count: 100 }
);
